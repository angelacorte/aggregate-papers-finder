## List of filtered papers:

Visitable but not editable at [https://angelacorte.github.io/aggregate-papers-finder/checker/dynamicList.html](https://angelacorte.github.io/aggregate-papers-finder/checker/dynamicList.html).

To edit the content, clone the repository and run: 
```bash
npm run start
```

## Fetching papers

To fetch papers infos and have them in JSON format, run the following command:
```bash
kotlinc -script doifetch.main.kts
```
You can then use this file in the `checker` folder to update the list of papers.

Or you can download the paper PDFs with:
```bash
kotlinc -script datafetch.main.kts
```
Papers will appear in the `script/downloads` folder.