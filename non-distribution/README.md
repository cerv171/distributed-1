
# M0: Setup & Centralized Computing

> Add your contact information below and in `package.json`.

* name: `Colin Pascual`

* email: `colin_pascual@brown.edu`

* cslogin: `ctpascua`


## Summary

> Summarize your implementation, including the most challenging aspects; remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete M0 (`hours`), the total number of JavaScript lines you added, including tests (`jsloc`), the total number of shell lines you added, including for deployment and testing (`sloc`).


My implementation consists of 8 components addressing T1--8. The most challenging aspect was implementing the merge.js component because it required lots of refreshing on javascript syntax and parsing, and carefully reasoning through data states to ensure that my output global-index.txt was consistent with what we expected.


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation.


To characterize correctness, I developed 10 tests. I wrote end-to-end tests with https://cs.brown.edu/courses/csci1380/sandbox/2/ (a small collection of fullbooks) to ensure that the engine parsed all links as expected and had a resulting index that was correct. Furthermore, I wrote unit-tests for each implemented componenet using the html of https://cs.brown.edu/courses/csci1380/sandbox/1/ as well as edge cases that I curated, especially with query.js ensuring that the type of search we were doing matched the n-gram search expected.


*Performance*: The throughput of various subsystems is described in the `"throughput"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.


## Wild Guess

> How many lines of code do you think it will take to build the fully distributed, scalable version of your search engine? Add that number to the `"dloc"` portion of package.json, and justify your answer below.

I expect to build the fully dsitrbitued scalable version it might take around 3k lines of code, I assume we need to handle things like distributed hash tables for using multiple nodes and handling concurrent writes to our index data which will require lots of code. MapReduce framework for distributed processing will likely also require lots of code.