/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  /* This file is only used for local development, to change the parameters in lambda, change the object in build.ts*/
  plugins: [
    {
      resolve: "gatsby-plugin-styled-components",
      options: {
        displayName: true,
      },
    },
    {
      resolve: "gatsby-source-dynamodb-custom",
      options: {
        typeName: "AwsAppPage",
        queryType: "query",
        params: {
          TableName: "app-page-dev",
          IndexName: "siteId-index",
          ProjectionExpression: "#siteId, slug, blockOrder, #id",
          KeyConditionExpression: "#siteId = :siteId",
          ExpressionAttributeNames: {
            "#siteId": "siteId",
            "#id": "id",
          },
          ExpressionAttributeValues: {
            ":siteId": "site_6309110f-025d-455d-a30a-6647880b030b",
          },
        },
      },
    },
    {
      resolve: "gatsby-source-dynamodb-custom",
      options: {
        typeName: "AwsAppSite",
        queryType: "query",
        params: {
          TableName: "app-site-dev",
          ProjectionExpression: "#id, #name, menu, domainName, brandId",
          KeyConditionExpression: "#id = :id",
          ExpressionAttributeNames: {
            "#id": "id",
            "#name": "name",
          },
          ExpressionAttributeValues: {
            ":id": "site_6309110f-025d-455d-a30a-6647880b030b",
          },
        },
      },
    },
    {
      resolve: "gatsby-source-dynamodb-custom",
      options: {
        queryType: "get",
        typeName: "AwsAppBrandStyle",
        params: {
          TableName: "app-brand-style-dev",
          ProjectionExpression: "id, properties, brandId",
          Key: {
            id: "bstyle_5530addc-7219-4f51-94e8-21cb11cac06e",
          },
        },
      },
    },
    {
      resolve: "gatsby-source-dynamodb-custom",
      options: {
        typeName: "AwsAppBlock",
        queryType: "query",
        params: {
          TableName: "app-block-dev",
          IndexName: "siteId-index",
          ProjectionExpression:
            "#siteId, pageId, isDrafted, properties, id, #name",
          KeyConditionExpression: "#siteId = :siteId",
          ExpressionAttributeNames: {
            "#siteId": "siteId",
            "#name": "name",
          },
          ExpressionAttributeValues: {
            ":siteId": "site_6309110f-025d-455d-a30a-6647880b030b",
          },
        },
      },
    },
    {
      resolve: "gatsby-source-dynamodb-custom",
      options: {
        typeName: "AwsAppAssets",
        queryType: "query",
        params: {
          TableName: "app-asset-dev",
          IndexName: "brandId-index",
          KeyConditionExpression: "#brandId = :brandId",
          ExpressionAttributeNames: {
            "#brandId": "brandId",
          },
          ExpressionAttributeValues: {
            ":brandId": "brand_349b38bf-9958-41ba-9dd0-2c18525b2664",
          },
        },
      },
    },
  ],
}
