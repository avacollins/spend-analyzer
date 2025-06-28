# PrioritiesUSA - FLOCK AdHawk Frontend Exercise (Senior Fullstack Engineer)

This exercise is designed to test your ability to create a frontend application. A dataset has been provided containing a sample of advertising data for use in this problem.

**This exercise is meant to test your frontend development and data visualization skills only. You may assume the data is available as a static file and may load it entirely into memory. You are not expected to build a backend API or database.**

This exercise is deliberately open-ended. You are free to use any framework and libraries you feel suit the problem. The use of AI tools is *not prohibited* during this exercise, but we do ask that you disclose any AI use and mark any code sections generated and included without modification.

**Complete solutions will provide a well-documented application with setup and startup instructions that we can reproduce for testing purposes.** Some examples of acceptable submissions include a zipped project directory with a README or code files alongside a link to a self-hosted frontend. Any submission which shows your work and allows us to evaluate your code and frontend design is acceptable. **Please ensure your submission does not include personally identifiable information. These exercises are evaluated anonymously.**

**This project is expected to take four hours. If you are unable to complete it in the time alloted, please provide a written explanation of what you would have done given more time.** Please send your final submissions to peopleops@priorities.org by end of day 07/01/2025. *Because we recognize that this exercise is an investment of your time, we will provide a cash equivalent e - gift card (visa, amex, mastercard) upon submission of a complete exercise by the requested deadline. The gift card value for this exercise will be $60.00.*

## Problem Description
You have been tasked with creating an intuitive, customized dashboard application for a new partner --- a progressive political advertiser --- so that they can aggregate and filter a set of advertising data. They have asked that you use your expertise in data visualization to take a first attempt at the data presentation and analysis options available in the dashboard; their only requirement is that you allow them to dynamically aggregate and filter the data live in the application. They've warned you that some of the data may include duplicated, malformed, or null values, and that you may have to clean the data before presenting it.

They have provided a few questions they’d like to be able to answer in the final product:
- Which elections has a given advertiser spent the most in?
- How much has been spent by topic in a given election?
- How has a given advertiser spent over time?

If you have any questions or technical problems regarding the exercise, please email peopleops@priorities.org.


High Level Steps

- Research chart libraries and dashboard templates
- Create react app with next
- Add redux state 
- Add papaparse and mui libraries
- Add upload data page - Copilot assist on the normalization and deduplication methods
- Filter data after upload, parse to redux slices - Copilot autocomplete
- Move upload to component
- Create Dashboard Layout with DataLoader component
- Add unit tests to dataTransform utility - Copilot
- Add nivo charts