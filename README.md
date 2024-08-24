# allrecipes-scraper
A node.js library to search and scrape recipes from allrecipes.com

This is a scraper, no API key is needed.

## Usage
### Search
```
const ar = require('allrecipes-scraper);
const page1 = await ar.search('pizza');

/*
  page1:
  {
    recipes: [
        {
            "title": "Easy Homemade Pizza Dough",
            "url": "https://www.allrecipes.com/recipe/20171/quick-and-easy-pizza-crust/",
            "image": "https://...jpg"
        },
        ...
    ]
    offset: 24,
    continue: true
  }
*/

// If page1.continue === true, you can go to page 2:
const page2 = await ar.search('pizza', page1);
```
### Pull recipe data
```
const ar = require('allrecipes-scraper`);
const paneertikka = await ar.getRecipe('https://www.allrecipes.com/recipe/240652/paneer-tikka-masala/');

/*
  paneertikka:
  {
    title: "Paneer Tikka Masala",
    url: "https://www.allrecipes.com/recipe/240652/paneer-tikka-masala/",
    rating: 4.9,
    reviews: 14,
    image: "https://...jpg",
    details: {
        "Prep Time": "20 mins",
        "Cook Time": "40 mins",
        ...
    },
    ingredients: [
        "¼ cup butter",
        ...
    ],
    steps: [
        "Melt butter...",
        ...
    ],
    nutrition: "<html code here>"
  }
*/
```
