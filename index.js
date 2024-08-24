'use strict';
const axios = require('axios');
const cheerio = require('cheerio');

// Best effort to scrape allrecipe's inconvenient search feature

async function addGallery(url, recipes) {
    // scrape results from allrecipe's dumb "gallery" results
    const galleryResult = await axios(url);
    const html = galleryResult.data;
    const $ = cheerio.load(html);
    const items = $('.comp.list-sc-item.mntl-block.mntl-sc-list-item');
    items.each((idx, val) => {
        const title = $('.mntl-sc-block-heading__text', val).text().trim();
        const link = $('.mntl-sc-block-universal-featured-link__link.mntl-text-link.button--contained-standard.type--squirrel', val).attr('href');
        const image = $(val).find('img').eq(0).attr('data-src')
        // TODO: get images and ratings
        if (link && link.indexOf('/recipe') > 0) {
            recipes.push({
                link, title, image
            });
        }
    });
};

function removeDuplicates(recipes) {
    let recipeSet = [];
    recipes.forEach(recipe => {
        const dup = recipeSet.find(r => r.link === recipe.link);
        if (!dup) {
            recipeSet.push(recipe);
        }
    });
    return recipeSet;
};

async function search(query, results) {
    const encoded = encodeURIComponent(query);
    let searchURL = `https://www.allrecipes.com/search?q=${encoded}`;
    if (results && results.offset) {
        if (results.continue) {
            searchURL = `${searchURL}&offset=${results.offset}`;
        } else {
            // Just return empty, there isn't anything else
            return {
                recipes: [],
                offset: results.offset,
                continue: false
            };
        }
    }
    const result = await axios(searchURL);
    const html = result.data;
    const $ = cheerio.load(html);
    const cards = $('.comp.mntl-card-list-items.mntl-document-card.mntl-card.card.card--no-image');
    let recipes = [];
    let promises = [];
    cards.each((idx, val) => { 
        const link = $(val).attr('href');
        const image =  $(val).find('img').eq(0).attr('data-src');
        const title =  $('.card__title-text', val).text();
        // TODO: get images and ratings
        if (link.indexOf('/recipe') > 0) {
            recipes.push({
                link,
                title,
                image
            });
        } else if (link.indexOf('/gallery', val) > 0) {
            /* traverse the gallery to scrape the recipe results
               that should have just been in the search results
               in the first place
            */
            promises.push(addGallery(link, recipes));
        }
    });
    await Promise.all(promises);
    recipes = removeDuplicates(recipes);
    let offset = $(cards).length;
    if (results && results.offset) {
        offset += results.offset;
    }
    // Check if there is a 'next' button
    const nextButton = $('.mntl-pagination__next').text();
    return {
        recipes,
        offset,
        continue: (nextButton !== '')
    }
};

async function getRecipe(url) {
    const html = (await axios(url)).data;
    const $ = cheerio.load(html);
    const title = $('.article-heading.type--lion').text();
    const rating = parseFloat($('.comp.mm-recipes-review-bar__rating.mntl-text-block.type--squirrel-bold').text());
    const reviews = parseInt($('.comp.mm-recipes-review-bar__rating-count.mntl-text-block.type--squirrel').text().replace('(', '').replace(')', ''));
    const image = $('.img-placeholder').find('img').eq('0').attr('src');
    const details = {};
    $('.mm-recipes-details__item').each((idx, val) => {
        const key = $('.mm-recipes-details__label', val).text().trim();
        const value = $('.mm-recipes-details__value', val).text().trim();
        details[key] = value;
    });
    let ingredients = [];
    $('.mm-recipes-structured-ingredients__list-item').each((idx, val) => {
        ingredients.push($('p', val).text().trim());
    });
    let steps = [];
    $('.comp.mntl-sc-block.mntl-sc-block-startgroup.mntl-sc-block-group--LI').each((idx, val) => {
        steps.push($('p', val).text().trim());
    });
    const nutrition = $('.comp.mm-recipes-nutrition-facts-summary').html();
    return {
        title, url, rating, reviews, image, details, ingredients, steps, nutrition
    };
}

module.exports.search = search;
module.exports.getRecipe = getRecipe;
