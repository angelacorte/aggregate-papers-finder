#!/usr/bin/env kotlin

// Import skrapeit
@file:DependsOn("it.skrape:skrapeit:1.1.5")
// Import kotlin serialization json
@file:DependsOn("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
@file:DependsOn("com.lordcodes.turtle:turtle:0.10.0")

import com.lordcodes.turtle.ShellRunException
import com.lordcodes.turtle.shellRun
import it.skrape.fetcher.HttpFetcher
import it.skrape.fetcher.Request
import it.skrape.fetcher.Scraper
import it.skrape.fetcher.response
import it.skrape.fetcher.skrape
import kotlinx.coroutines.delay
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.File
import java.net.URI
import kotlin.math.max

val proceedings = listOf(
    "https://dblp.uni-trier.de/db/conf/saso/index.html",
    "https://dblp.uni-trier.de/db/conf/acsos/index.html",
    "https://dblp.uni-trier.de/db/conf/icac/index.html",
)
val confFinder = Regex(
    """<\s*a\s+href=\"(https://dblp\.uni-trier\.de/[^<]+?\.html)\"[^<]+?><\s*img[^<]+?>\s*table\s+of\s+contents\s+in\s+dblp"""
)
val unpaywallFinder = Regex("""data-doi=\"(.*?)\"""")
fun Scraper<Request>.request(page: String) = request {
    userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    url = page
}
val metadataFinder = Regex("""xplGlobal\s*\.\s*document\s*\.\s*metadata=(.*);""")
val scihubFinder = Regex("""embed\s+type=\"application/pdf\"\s+src=\"([^#&]+.pdf)""")

@Volatile var minWaitPerRequest = 0

data class ScrapedPaper(val title: String, val abstract: String?, val year: Int, val doi: String, val download: String)

object VPN {

    data class Location(val name: String, var lastUsed: Long = 0)

    val wait: Long = 15 * 60 * 1000
    var currentLocation: Int = 0
}

val papers = proceedings.asSequence()
    .flatMap { conferenceUrl ->
        skrape(HttpFetcher) {
            request(conferenceUrl)
            response {
                confFinder.findAll(responseBody).map { it.destructured.component1() }
            }
        }
    } // Conference URLs
    .flatMap { editionUrl ->
        skrape(HttpFetcher) {
            request(editionUrl)
            response {
                unpaywallFinder.findAll(responseBody).map { it.destructured.component1().replace("%2F", "/") }
            }
        }
    }
    .map { paperDoi ->
        skrape(HttpFetcher) {
            delay(minWaitPerRequest.toLong())
            request("https://api.crossref.org/works/$paperDoi")
            response {
                val rateLimit = headers["X-Rate-Limit-Limit"]?.toInt()
                val rateInterval = headers["X-Rate-Limit-Interval"]?.dropLast(1)?.toInt()
                if (rateLimit != null && rateInterval != null) {
                    minWaitPerRequest = rateInterval * 1000 / rateLimit
                }
                val response = Json.parseToJsonElement(responseBody).jsonObject
                val message = checkNotNull(response["message"]) { "no message for $paperDoi" }.jsonObject
                val title = checkNotNull(message["title"]) { "no title for $paperDoi" }.jsonArray[0]
                val publishedPrint = checkNotNull(message["published-print"] ?: message["created"]) {
                    "no published-print or created for $paperDoi:\n$response"
                }.jsonObject
                val dateParts = checkNotNull(publishedPrint["date-parts"]) {
                    "no date-parts for $publishedPrint in $paperDoi:\n$response"
                }.jsonArray
                val year = dateParts[0].jsonArray[0].jsonPrimitive.toString().toInt()
                val sciHubUrl = "https://sci-hub.se/$paperDoi"
                val abstract = response["abstract"]?.jsonPrimitive?.content
                ScrapedPaper(title.toString(), abstract, year, paperDoi, sciHubUrl)
            }
        }
    }
    .filter { paper ->
        when {
            "aggregate" in paper.title -> true
            "aggregate" in paper.abstract.orEmpty() -> true
            "field" in paper.title -> true
            "field" in paper.abstract.orEmpty() -> true
            "amorphous" in paper.title -> true
            "amorphous" in paper.abstract.orEmpty() -> true
            "proto" in paper.title -> true
            "proto" in paper.abstract.orEmpty() -> true
            "coordination" in paper.title -> true
            "coordination" in paper.abstract.orEmpty() -> true
            "self-organizing" in paper.title -> true
            "self-organizing" in paper.abstract.orEmpty() -> true
            else -> {
                fun searchOnSciHub() = skrape(HttpFetcher) {
                    request(paper.download)
                    response {
                        val pdfUrl = scihubFinder.find(responseBody)?.destructured?.component1()
                        pdfUrl?.removePrefix("/")?.let { "https://sci-hub.se/$it" }
                    }
                }
                val pdfUrl = runCatching { searchOnSciHub() }
                    .recover {
                        searchOnSciHub()
                    }.getOrThrow()
                if (pdfUrl != null) {
                    val folder = File("downloaded")
                    folder.mkdirs()
                    val filename = paper.title.replace(Regex("[^\\w]"), "")
                    val pdf = folder.resolve("$filename.pdf")
                    val txt = folder.resolve("$filename.txt")
                    var attempt = 0
                    while (!pdf.exists() && attempt++ < 3) {
                        runCatching {
                            pdf.writeBytes(URI(pdfUrl).toURL().openStream().readBytes())
                            println("Running pdftotext on $pdf")
                            shellRun(workingDirectory = folder) {
                                command(
                                    "pdftotext",
                                    listOf(pdf.absolutePath),
                                )
                            }
                        }.onFailure {
                            println("Failed to download ${paper.doi} from $pdfUrl: ${it::class} ${it.message}")
                            when (it){
                                is ShellRunException -> pdf.delete()
                            }
                        }.onSuccess {
                            println("Downloaded ${paper.doi} from $pdfUrl")
                        }
                    }
                    if (!txt.exists()) {
                        txt.writeText("")
                    }
                    val text = txt.readText()
                    "aggregate" in text
                    "proto" in text
                    "amorphous" in text
                    "field" in text
                    "spatial" in text
                    "self-organizing" in text
                    "coordination" in text
                } else {
                    false
                    }
                }
            }
    }
    .onEach { println("${it.title} mentions ac ecc") }
    .groupBy { it.year }
File("result.log").writeText(papers.toString())
println(papers)
println(papers.mapValues { (_, list) -> list.count() })
