// buttons posts,dialogs
const createPostBtn = document.getElementById("create-post-btn");
const showStatsBtn = document.getElementById("show-stats-btn");

const articleDialog = document.getElementById("article-dialog");
const closeArticleDialogBtn = document.getElementById("close-article-dialog");
const cancelFormBtn = document.getElementById("cancel-form-btn");
const blogForm = document.getElementById("blog-form");

// blog posts container and template
const blogCardsContainer = document.getElementById("blog-cards");
const blogCardTemplate = document.getElementById("blog-card-template");

// statistics dialog elements
const statsDialog = document.getElementById("stats-dialog");
const closeStatsDialogBtn = document.getElementById("close-stats-dialog");
const postsCountElement = document.getElementById("posts-count");

// Count current blog posts
function getPostsCount() {
    return blogCardsContainer.querySelectorAll(".blog-card").length;
}

// Update posts count in statistics dialog
function updatePostsCount() {
    postsCountElement.textContent = getPostsCount();
}

// Open and close article dialog
function openArticleDialog() {
    articleDialog.showModal();
}

function closeArticleDialog() {
    articleDialog.close();
}

// open, close statistics dialog
function openStatsDialog() {
    updatePostsCount();
    statsDialog.showModal();
}

function closeStatsDialog() {
    statsDialog.close();
}

// add a new mock post using template
function addMockPost() {
    const templateContent = blogCardTemplate.content.cloneNode(true);
    blogCardsContainer.appendChild(templateContent);
    updatePostsCount();
}

// button actions
createPostBtn.addEventListener("click", openArticleDialog);
closeArticleDialogBtn.addEventListener("click", closeArticleDialog);
cancelFormBtn.addEventListener("click", closeArticleDialog);

showStatsBtn.addEventListener("click", openStatsDialog);
closeStatsDialogBtn.addEventListener("click", closeStatsDialog);

// add post on form submit
blogForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addMockPost();
    blogForm.reset();
    closeArticleDialog();
});

// close dialogs when clicking outside the dialog content
articleDialog.addEventListener("click", function (event) {
    if (event.target === articleDialog) {
        closeArticleDialog();
    }
});

statsDialog.addEventListener("click", function (event) {
    if (event.target === statsDialog) {
        closeStatsDialog();
    }
});

// Set initial posts count
updatePostsCount();