'use strict';

const ar = require('../../index');
const {expect} = require('chai');

function notNull(item, label) {
    expect(item).not.undefined;
    expect(item).not.eql('');
    expect(item).not.null;
    console.log(`${label}: ${item}`);
}

function checkSearchResult(result) {
    notNull(result.link, 'Link');
    notNull(result.title, 'Title');
}

async function searchTest(query) {
    const results = await ar.search(query);
    expect(results.recipes.length).gt(0)
    console.log(`fetched ${results.recipes.length} recipes`);
    // check first recipe
    console.log('First search result on page 1:');
    checkSearchResult(results.recipes[0]);
    // Try to get next page
    const results2 = await ar.search(query, results);
    if (results.continue) {
        // There was a next page
        expect(results2.recipes.length).gt(0);
        console.log(`Page 2 loaded ${results2.recipes.length} results`);
        // check first recipe
        console.log('First search result on page 2:');
        checkSearchResult(results2.recipes[0]);
    } else {
        expect(results2.recipes.length).eql(0);
        expect(results2.continue).eql(false);
        console.log('Page 1 end of results');
    }
}

describe('allrecipes-scraper', function() {
    describe('search', function() {
        // 1 page result
        it('paneer tikka', async function() {
            await searchTest('paneer tikka masala');
        });
        // multi page result
        it('pizza', async function() {
            await searchTest('pizza');
        });
    });
    describe('getRecipe', function() {
        it('bierocks', async function() {
            const result = await ar.getRecipe('https://www.allrecipes.com/recipe/23658/pams-bierocks/');
            notNull(result.title, 'Title');
            notNull(result.url, 'Url');
            notNull(result.details, 'Details');
            notNull(result.ingredients, 'Ingredients');
            notNull(result.steps, 'Steps');
            if(result.rating) {
                console.log(`Rating: ${result.rating}`);
            }
            if(result.reviews) {
                console.log(`Reviews: ${result.reviews}`);
            }
        })
    })
});
