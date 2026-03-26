// buttons posts,dialogs
const createPostBtn = document.getElementById("create-post-btn");
const showStatsBtn = document.getElementById("show-stats-btn");

const articleDialog = document.getElementById("article-dialog");
const closeArticleDialogBtn = document.getElementById("close-article-dialog");
const cancelFormBtn = document.getElementById("cancel-form-btn");
const blogForm = document.getElementById("blog-form");

// form inputs
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");

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

// create current date for new post
function getCurrentPublishedDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// add a new post using form data and template
function addPostFromForm() {
    const templateContent = blogCardTemplate.content.cloneNode(true);

    const postTitle = templateContent.querySelector(".template-post-title");
    const postText = templateContent.querySelector(".template-post-text");
    const postDate = templateContent.querySelector(".blog-card-date");

    postTitle.textContent = titleInput.value.trim();
    postText.textContent = contentInput.value.trim();
    postDate.textContent = `Published: ${getCurrentPublishedDate()}`;

    blogCardsContainer.appendChild(templateContent);
    updatePostsCount();
}

// delete post when clicking delete button
blogCardsContainer.addEventListener("click", function (event) {
    const deleteBtn = event.target.closest(".delete-post-btn");

    if (!deleteBtn) {
        return;
    }

    const blogCard = deleteBtn.closest(".blog-card");

    if (blogCard) {
        blogCard.remove();
        updatePostsCount();
    }
});

// button actions
createPostBtn.addEventListener("click", openArticleDialog);
closeArticleDialogBtn.addEventListener("click", closeArticleDialog);

showStatsBtn.addEventListener("click", openStatsDialog);
closeStatsDialogBtn.addEventListener("click", closeStatsDialog);

// add post on form submit
blogForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addPostFromForm();
    blogForm.reset();
    closeArticleDialog();
});

// reset and close form on cancel button
cancelFormBtn.addEventListener("click", function () {
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