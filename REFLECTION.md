# Reflection: Building with AI Agents

## What I Learned Using AI Agents

Collaborating with AI agents on the FuelEU Maritime Compliance Dashboard was a masterclass in architectural discipline and rapid prototyping. I learned that AI agents excel when given clear, strict constraints—in this case, Hexagonal Architecture. By explicitly defining the separation between the core domain, use cases, ports, and adapters upfront, the AI was able to scaffold the entire project logically without entangling business logic with infrastructure concerns. 

I also learned the importance of iterative prompting and validation. When building complex domain logic like the `ComputeCB` (Compliance Balance) calculations, the AI could swiftly generate the mathematical algorithms, but it required human oversight to ensure nuanced temporal rules—like validating that a route's specific year matched the calculation year—were strictly enforced. The AI acts as an incredibly powerful engine, but the developer must still act as the navigator, constantly verifying that the output aligns with the real-world business requirements.

## Efficiency Gains vs. Manual Coding

The efficiency gains were staggering, estimating a 400-500% increase in development speed compared to manual coding alone. 

1. **Boilerplate and Scaffolding:** What typically takes hours—setting up a Node.js/Express server, configuring TypeScript, establishing the React/Vite frontend with Tailwind CSS, and creating the Prisma database schema—was accomplished in minutes.
2. **Refactoring and Migrations:** When we decided to pivot from raw SQL to Prisma ORM, the AI was able to rewrite the entire data access layer, regenerate the schema, and port the seed data almost instantaneously. Doing this manually would have required tedious, error-prone text replacement and SQL translation.
3. **UI Generation:** Building aesthetically pleasing, responsive UI components (like the interactive Comparison chart and the Pooling checkbox grid) was incredibly fast. The AI could instantly synthesize Tailwind utility classes to create complex layouts that would otherwise require significant CSS trial and error.

## Improvements I'd Make Next Time

While the outcome was highly successful, there are several areas I would improve in my approach for future AI-assisted projects:

1. **Test-Driven Development (TDD) from the Start:** I would prompt the AI to write unit tests for the core domain logic *before* implementing the use cases. While we relied heavily on TypeScript's compilation checks (`tsc --noEmit`) to verify contracts, having a robust suite of Jest tests would have caught edge cases (like the UUID mismatch bug) earlier in the development cycle.
2. **Finer-Grained Task Boundary Management:** At times, I asked the AI to tackle very large chunks of work simultaneously (e.g., "build all remaining controllers"). It is generally safer to break these down into smaller, atomic prompts (e.g., "build the Banking controller, verify it, then build Pooling"). This makes debugging easier and prevents the AI's context window from becoming overwhelmed.
3. **More Context in Prompts:** I realized that providing exact snippets of the target data structures directly in the initial prompts reduces the amount of refactoring needed later. Next time, I will supply more concrete JSON payload examples upfront to ensure the AI's generated types perfectly match expectations on the first pass.
