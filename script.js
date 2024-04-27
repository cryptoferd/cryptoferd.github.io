// Function to fetch images from the server
function fetchImages() {
    // Assuming you have an endpoint on the server that returns a list of image filenames
    fetch('/getImages')
        .then(response => response.json())
        .then(data => {
            // Process the received data and update the grid with images and titles
            updateGrid(data);
        })
        .catch(error => console.error('Error fetching images:', error));
}

// Function to update the grid with images and titles
function updateGrid(images) {
    const gridContainer = document.getElementById('gridContainer');
    // Clear the grid
    gridContainer.innerHTML = '';
    // Loop through the images and add them to the grid
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        // Create a title element
        const titleElement = document.createElement('div');
        titleElement.classList.add('image-title');
        titleElement.textContent = `Phunk #${image.number}`;
        // Append the image and title to the grid container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.appendChild(imgElement);
        imageContainer.appendChild(titleElement);
        gridContainer.appendChild(imageContainer);
    });
}

// Call fetchImages when the page loads
fetchImages();
