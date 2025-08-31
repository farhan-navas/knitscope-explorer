## Inspiration
Debugging dependency injection issues in Kotlin felt like solving a puzzle blindfolded. We'd spend hours tracing through constructor parameters and config files just to understand why a service wasn't getting injected properly. We needed a way to actually *see* our DI container's structure.

## What it does
Knitscope visualizes your Kotlin dependency injection container as an interactive graph. It shows which classes depend on what, highlights circular dependencies, and maps out injection scopes - turning invisible relationships into clear visual connections.

## How we built it
We build knitscope as a CLI tool build in Kotlin, and a web-based visualization layer built in D3.js and React. The Kotlin CLI would parse the bytecode created from the project to look for DI injections. Once all the Injection Relationships are found, the CLI URL-encodes the respective relationships, and gives the user a link they can click on to view our frontend. 

Our frontend is a D3.js visualization built in React. It reades the graph as a JSON object, and renders it as an interactive graph. We used the following technologies, Zustand for state management, zod for data validation, tailwind for CSS, Vite as our build tool,

## Challenges we ran into
Parsing the Bytecode was a challenge - we had to find a way to extract the DI annotations from the bytecode, and then parse them into a format that could be rendered. Since we were direcly parsing the bytecode, we ended up detecting some dependency relationships that were NOT a part of knit (e.g. type dependencies). Filtering out these were a challenge. 

## Accomplishments that we're proud of
The real-time visualization actually works! Watching dependencies light up as you navigate through your app feels magical. We also nailed the user experience - the CLI directly gives users a link they can access, greatly reducing the friction of using this tool.

We are also proud of the architecture we chose for this project. While one alternative would be to simply parse the DI annotations directly, we choose the more difficult path of using the Kotlin JVM directly, looking inside the bytecode for the DI injections instead. using this method, not only isit vastly more efficient (our code runs in less than 0.2 s for the demo project) we can also easily extend our project to show other information (e.g. showing if a producer is a singleton.)

## What we learned
User experience is King. We spend alot of time thinking about how to make this tool as seamless as possible. Initially, we wanted to create a server that could accept a github link and would return/display a graph. After considering this further, we realised that this would create too much friction for the the user. We eventually settled on creating a CLI tool.

## What's next for Knitscope
Integration with more DI frameworks, further integration using a IDE plugin for further ease of use.
