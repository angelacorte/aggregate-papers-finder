#!/usr/bin/env kotlin

// Import skrapeit
@file:DependsOn("it.skrape:skrapeit:1.1.5")
// Import kotlin serialization json
@file:DependsOn("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
@file:DependsOn("com.lordcodes.turtle:turtle:0.10.0")

import it.skrape.fetcher.HttpFetcher
import it.skrape.fetcher.Request
import it.skrape.fetcher.Scraper
import it.skrape.fetcher.response
import it.skrape.fetcher.skrape
import java.io.File


val authors = listOf(
    "https://dblp.org/pid/35/9084.html", //danilo pianini
    "https://dblp.org/pid/v/MirkoViroli.html",
    "https://dblp.org/pid/183/5159.html", //roberto casadei
    "https://dblp.org/pid/135/6306.html", //giorgio audrito
    "https://dblp.org/pid/19/4742.html", //ferruccio damiani
    "https://dblp.org/pid/42/1953.html", //jacob beal
    "https://dblp.org/pid/294/4314.html", //gianluca aguzzi
    "https://dblp.uni-trier.de/search?q=amorphous+computing", //amorphous computing
)

val unpaywallFinder = Regex("""data-doi=\"(.*?)\"""")
val titleFinder = Regex("""atitle=(.*?).&rft""")
val tripleFinder = Regex("""data-doi=\"(.*?)\".*?atitle=(.*?).&rft.*?date=(.*?)&rft""")
//val bothRegex = Regex("""data-doi=\"(.*?)\".*?atitle=(.*?).&rft""")
fun Scraper<Request>.request(page: String) = request {
    userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    url = page
}
val metadataFinder = Regex("""xplGlobal\s*\.\s*document\s*\.\s*metadata=(.*);""")
val scihubFinder = Regex("""embed\s+type=\"application/pdf\"\s+src=\"([^#&]+.pdf)""")

@Volatile var minWaitPerRequest = 0

data class Paper(val title: String, val year: Int, val doi: String)

val dois = authors.asSequence()
    .flatMap { authorUrl ->
        skrape(HttpFetcher) {
            request(authorUrl)
            response {
                tripleFinder.findAll(responseBody).map {
                    Paper(
                        it.destructured.component2()
                            .replace("+", " ")
                            .replace("%2C", ",")
                            .replace("%2F", "/")
                            .replace("%3", ":")
                            .replace("%26", "&")
                            .replace("%27", "'")
                            .replace("%28", "(")
                            .replace("%29", ")"),
                        it.destructured.component3().toInt(),
                        it.destructured.component1().replace("%2F", "/")
                    )
                }
            }
        }
    } // author dois
    .toSet()
    .sortedBy { it.year }

File("dois.json").writeText(dois.map { "\n{ \"title\": \"${it.title}\", \"year\": ${it.year}, \"url\": \"https://doi.org/${it.doi}\", \"notes\": \"\"}" }.toString())

val withLink = dois.map { "<p><a href=\"https://doi.org/${it.doi}\">${it.title} (${it.year})</a></p>\n" }
File("dois.html").writeText(withLink.toString())
