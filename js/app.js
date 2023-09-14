const categorySelect = document.querySelector('#categorias');
const recipesList = document.querySelector('#resultado');
const modal = new bootstrap.Modal('#modal', {});
const divFavorites = document.querySelector('.favoritos');

document.addEventListener('DOMContentLoaded', () => {
    
    if(categorySelect) {
        categorySelect.addEventListener('change', readOption)
        findCategories()
    }
    if(divFavorites) {
        getFavorites()
    }
})

const clearHTML = content => {
    while(content.firstChild) {
        content.removeChild(content.firstChild)
    }
}

const fillCategoriesOptions = (categories = []) => {
    categories.forEach(category => {
        const {strCategory, idCategory} = category;
        const optionCategory = document.createElement('OPTION');
        optionCategory.textContent = strCategory;
        optionCategory.value = strCategory;
        optionCategory.dataset.id = idCategory;
        categorySelect.appendChild(optionCategory);
    })
}

const showRecipes = (recipes = []) => {
    clearHTML(recipesList ?? divFavorites)

    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    
    heading.textContent = recipes.length ? 'Results:' : 'Not results found';
    recipesList.appendChild(heading);

    recipes.forEach(recipe => {
        const {strMeal, idMeal, strMealThumb} = recipe;

        const containerRecipe = document.createElement('DIV');
        containerRecipe.classList.add('col-md-4');

        const cardRecipe = document.createElement('DIV');
        cardRecipe.classList.add('card', 'mb-4');

        const imageRecipe = document.createElement('IMG');
        imageRecipe.classList.add('card-img-top');
        imageRecipe.src = strMealThumb ?? recipe.img;
        imageRecipe.alt = `image of the recipe ${strMeal}`

        const bodyCardRecipe = document.createElement('DIV');
        bodyCardRecipe.classList.add('card-body');

        const titleRecipe = document.createElement('H3');
        titleRecipe.classList.add('card-title', 'mb-3');
        titleRecipe.textContent = strMeal ?? recipe.name;

        const buttonRecipe = document.createElement('BUTTON');
        buttonRecipe.classList.add('btn', 'btn-danger', 'w-100');
        buttonRecipe.textContent = 'Look Recipe';
        buttonRecipe.onclick = () => findRecipe(idMeal ?? recipe.id);
        

        bodyCardRecipe.appendChild(titleRecipe);
        bodyCardRecipe.appendChild(buttonRecipe);
        cardRecipe.appendChild(imageRecipe);
        cardRecipe.appendChild(bodyCardRecipe);
        containerRecipe.appendChild(cardRecipe);

        recipesList.appendChild(containerRecipe);
    })
}

const showModalRecipe = (recipe = {}) => {
    const { strMeal, idMeal, strInstructions, strMealThumb } = recipe;
    
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');

    // Add content to the modal
    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}"/>
        <h3 class="my-3">Instructions:</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredients and Measures:</h3>
    `;

    const listGroup = document.createElement('UL');
    listGroup.classList.add('list-group');
    // Show ingredients and amounts
    for(let i = 1; i <= 20; i++) {
        if(recipe[`strIngredient${i}`]) {
            const ingregient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            const liIngredient = document.createElement('LI');
            liIngredient.classList.add('list-group-item');
            liIngredient.textContent = `${ingregient} - ${measure}`;
            listGroup.appendChild(liIngredient);
        }
    }
    modalBody.appendChild(listGroup)

    // favorites and close buttons
    const modalFooter = document.querySelector('.modal-footer');
    clearHTML(modalFooter);

    const favBtn = document.createElement('BUTTON');
    favBtn.classList.add('btn', 'btn-danger', 'col');
    favBtn.textContent = existInStorage(idMeal) ? 'Delete Favorite' : 'Save Favorite';
    favBtn.onclick = () => {
        if(!existInStorage(idMeal)) {
            addFav({
                id: idMeal,
                name: strMeal,
                img: strMealThumb
            })
            showToast('Added succesfully!')
            favBtn.textContent = 'Delete Favorite';
        } else {
            removeFav(idMeal)
            showToast('Deleted succesfully!')
            favBtn.textContent = 'Save Favorite';
        }
    }

    const closeModalBtn = document.createElement('BUTTON');
    closeModalBtn.classList.add('btn', 'btn-secondary', 'col');
    closeModalBtn.textContent = 'Close';
    closeModalBtn.onclick = () => modal.hide();

    modalFooter.appendChild(favBtn);
    modalFooter.appendChild(closeModalBtn);

    modal.show();
}

function addFav(recipe) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]));
}

function existInStorage(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    return favorites.some(favorite => favorite.id === id);
}

function removeFav(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    if(divFavorites) {
        showRecipes(updatedFavorites);
    }
}

function showToast(msg) {
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = msg;
    toast.show()
}

const getFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    if(favorites.length) {
        showRecipes(favorites)
    } else {
        const noFavorites = document.createElement('P');
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        noFavorites.textContent = `You don't have any favorites yet`;
        recipesList.appendChild(noFavorites);
    }
}

// fetch to get all the categories to fill the options of the select
async function findCategories() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

    try {
        const response = await fetch(url);
        const categories = await response.json();
        fillCategoriesOptions(categories.categories);
    } catch (error) {
        console.log(error)
    }
}

// fetch to an specific category, to then can show all the recipes of the category
async function readOption(e) {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${e.target.value}`

    try {
        const response = await fetch(url);
        const result = await response.json()
        showRecipes(result.meals);
    } catch (error) {
        console.log(error)
    }
}

// fetch to the recipe of the selected food
async function findRecipe(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

    try {
        const result = await fetch(url);
        const response = await result.json();
        showModalRecipe(response.meals[0]);
    } catch (error) {
        console.log(error);
    }
}

