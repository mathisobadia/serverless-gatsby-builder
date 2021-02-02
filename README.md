# Serverless gatsby builder

Build your gatsby website inside a serverless AWS lambda function

## Purpose

Gatsby is great to build static websites, but the site might need to be updated regularly because or changes in data. See [this issue](https://github.com/gatsbyjs/gatsby/issues/12817) for context. State of the art would be using netlify to trigger a new build, or the gatsby cloud offering. But you might need to trigger a lot of changes and build multiple sites at the same time using different data sources. In that case using a serverless lambda function becomes useful.

## Challenges

If you tried to build a gatsby website inside a lambda function you will run into some hurdles. Main issue is that only the /tmp folder has write permission. so building of the site needs to happen inside this folder. To solve this issue, we copy the sources files inside that folder. As we don't copy the /node_modules/ folder in the /tmp folder for better performance we need to add the /var/task/node_modules folder to the NODE_PATH variable. We also need to set CI=true to avoid build errors. (see env.yml)

Another issue is that the lambda environment allows a maximum of 250Mo of code. Gatsby is usually larger than that. To reduce the size of the published package we use webpack, reducing the size to around 64Mo for the hello world bare bone template. webpack configuration needs to be careful as we need to copy all gatsby source files. See CopyPlugin section in webpack.config.js for reference as you might need to add other source files.

## Serverless

1. **Change env variables**
   Open env.yml file and change the bucket names to something that you like (it needs to be globally unique to all AWS users so chances are you cannot use the default, as someone already has deployed this app)

   ```shell
   sls deploy --stage dev

   ```

   will deploy the serverless template in serverless.yml. It will create all necesarry ressources including the bucket containing the published gatsby site.

   The function build.ts is triggered by an SNS event. If the build time is more than 30sec (common for gatsby projects) then the function cannot be triggered by the REST API proxy or a graphQL event. You should create another endpoint that triggers the SNS event and return asynchronously.

## 🚀 Gatsby Quick start

1.  **Start developing.**

    Navigate into your new site’s directory and start it up.

    ```shell
    gatsby develop
    ```

2.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:8000`!

    _Note: You'll also see a second link: _`http://localhost:8000/___graphql`_. This is a tool you can use to experiment with querying your data. Learn more about using this tool in the [Gatsby tutorial](https://www.gatsbyjs.com/tutorial/part-five/#introducing-graphiql)._

    Open the `my-hello-world-starter` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

3.  **What's inside?**

A quick look at the top-level files and directories you'll see in a Gatsby project.

    .
    ├── node_modules
    ├── src
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── package-lock.json
    ├── package.json
    └── README.md

- **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

- **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”.

- **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

- **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

- **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.com/docs/gatsby-config/) for more detail).

- **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

4. 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.com/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.
