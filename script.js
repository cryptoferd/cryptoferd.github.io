document.addEventListener('DOMContentLoaded', async () => {
  let web3;
  let accounts;

  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const rainbowizeButton = document.getElementById('rainbowizeButton');
  const resultContainer = document.getElementById('resultContainer');
  const connectWalletButton = document.getElementById('connectWalletButton');
  const disconnectWalletButton = document.getElementById('disconnectWalletButton');
  const colorPickers = document.querySelectorAll('.color-picker');

  // Add these elements for image grid
  const imageGridContainer = document.getElementById('imageGridContainer');
  const fetchImagesButton = document.getElementById('fetchImagesButton');
  if (fetchImagesButton) {
    fetchImagesButton.addEventListener('click', fetchAndDisplayImages);
  }

  imageInput.addEventListener('change', handleImageUpload);
  rainbowizeButton.addEventListener('click', rainbowizeImage);
  connectWalletButton.addEventListener('click', connectWallet);
  disconnectWalletButton.addEventListener('click', disconnectWallet);

  // Add an event listener to fetch and display images button
  if (fetchImagesButton) {
    fetchImagesButton.addEventListener('click', fetchAndDisplayImages);
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          const previewWidth = 400;
          const previewHeight = 400;
          const scaleFactor = Math.min(previewWidth / img.width, previewHeight / img.height);

          // Set image preview
          imagePreview.innerHTML = '';
          const previewImage = document.createElement('img');
          previewImage.src = e.target.result;
          previewImage.style.width = `${img.width * scaleFactor}px`;
          previewImage.style.height = `${img.height * scaleFactor}px`;
          previewImage.style.imageRendering = 'pixelated'; // Set pixelated rendering
          imagePreview.appendChild(previewImage);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  function rainbowizeImage() {
    if (imagePreview.firstChild) {
      const originalWidth = imagePreview.firstChild.width;
      const originalHeight = imagePreview.firstChild.height;
      const gradientColors = Array.from(colorPickers).map(picker => picker.value);

      // Create SVG with dynamically updating background
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svg.setAttribute('width', originalWidth);
      svg.setAttribute('height', originalHeight);

      // Create a rect element for the dynamic background
      const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      backgroundRect.setAttribute('width', '100%');
      backgroundRect.setAttribute('height', '100%');
      backgroundRect.style.animation = 'rainbowBackground 7s linear infinite';

      svg.appendChild(backgroundRect);

      // Create a style element for CSS animations
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        rect {
          animation: rainbowBackground 7s linear infinite;
        }
      
        @keyframes rainbowBackground {
          0% {
            fill: ${gradientColors[0]};
          }
          14.28% {
            fill: ${gradientColors[1]};
          }
          28.57% {
            fill: ${gradientColors[2]};
          }
          42.86% {
            fill: ${gradientColors[3]};
          }
          57.14% {
            fill: ${gradientColors[4]};
          }
          71.43% {
            fill: ${gradientColors[5]};
          }
          85.72% {
            fill: ${gradientColors[6]};
          }
          100% {
            fill: ${gradientColors[0]};
          }
        }
      `;

      svg.appendChild(style);

      // Create image overlay
      const imageOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      imageOverlay.setAttribute('x', '0');
      imageOverlay.setAttribute('y', '0');
      imageOverlay.setAttribute('width', originalWidth);
      imageOverlay.setAttribute('height', originalHeight);
      imageOverlay.setAttribute('xlink:href', imagePreview.firstChild.src);
      imageOverlay.style.imageRendering = 'pixelated';

      svg.appendChild(imageOverlay);

      // Display the result
      resultContainer.innerHTML = '';
      resultContainer.appendChild(svg);
    }
  }

  async function connectWallet() {
    console.log('Connect Wallet button clicked!');
    if (window.ethereum || window.web3) {
      try {
        // Modern DApp browsers
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          web3 = new Web3(window.ethereum);
        }
        // Legacy dApp browsers
        else if (window.web3) {
          web3 = new Web3(window.web3.currentProvider);
        }

        accounts = await web3.eth.getAccounts();
        const networkName = await getNetworkName();

        // Display wallet address and network info
        document.getElementById('walletAddress').textContent = `Wallet Address: ${accounts[0]}`;
        document.getElementById('walletNetwork').textContent = `Network: ${networkName}`;
        document.getElementById('walletInfoContainer').style.display = 'block';

        // Hide Connect Wallet button and show Disconnect Wallet button
        connectWalletButton.style.display = 'none';
        disconnectWalletButton.style.display = 'block';
      } catch (error) {
        console.error(error);
        alert('Error connecting to wallet. Please try again.');
      }
    } else {
      alert('No Ethereum wallet found. Please install MetaMask or another wallet provider.');
    }
  }

  function disconnectWallet() {
    // Reset wallet information
    document.getElementById('walletAddress').textContent = '';
    document.getElementById('walletBalance').textContent = '';
    document.getElementById('walletNetwork').textContent = '';

    // Hide wallet information container
    document.getElementById('walletInfoContainer').style.display = 'none';

    // Show Connect Wallet button and hide Disconnect Wallet button
    connectWalletButton.style.display = 'block';
    disconnectWalletButton.style.display = 'none';
  }

  // Function to handle image grid display
  async function fetchAndDisplayImages() {
    // Make API call to fetch data
    const ethAddress = accounts[0]; // Assuming the connected wallet address is used
    const apiUrl = `https://api.wgw.lol/v1/mainnet/profiles/${ethAddress}/owned`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Check if the response has the expected structure
      if (data && data.total_count && data.data) {
        // Get the total number of images
        const totalImages = data.total_count;

        // Fetched image data is available in data.data array
        const imagesData = data.data;

        // Display images in the grid
        displayImagesInGrid(imagesData, totalImages);
      } else {
        console.error('Invalid API response format:', data);
        alert('Error fetching and displaying images. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching and displaying images:', error);
      alert('Error fetching and displaying images. Please try again.');
    }
  }

  // Function to display images in the grid
  function displayImagesInGrid(imagesData, totalImages) {
    const gridContainer = document.getElementById('imageGridContainer');

    // Clear existing grid content
    gridContainer.innerHTML = '';

    // Set the size of each grid cell
    const cellSize = 100;
    const maxImagesPerRow = 5;

    // Create a grid cell for each image
    imagesData.forEach((imageData, index) => {
      // Extract the content URI from the imageData
      const contentUri = imageData.content_uri;

      // Create a grid cell
      const cell = document.createElement('div');
      cell.className = 'gridCell';
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;

      // Create an element based on the content type
      const contentElement = createContentElement(contentUri);

      // Append the content element to the grid cell
      cell.appendChild(contentElement);

      // Append the grid cell to the grid container
      gridContainer.appendChild(cell);

      // Add line break after every maxImagesPerRow cells
      if ((index + 1) % maxImagesPerRow === 0) {
        gridContainer.appendChild(document.createElement('br'));
      }
    });

    // Log information for debugging
    console.log('Total images according to API response:', totalImages);
    console.log('Total images displayed in the grid:', imagesData.length);

    // Ensure the total number of grid cells matches the expected count
    if (imagesData.length !== totalImages) {
      console.error('Mismatch in total number of images.');
      alert('Error fetching and displaying images. Please try again.');
    }
  }

  // Function to create content element based on data URI
  function createContentElement(contentUri) {
    // Create an element based on the content type
    if (contentUri.startsWith('data:image')) {
      // If it's an image, create an image element
      const image = document.createElement('img');
      image.src = contentUri;
      image.alt = 'Image';
      return image;
    } else {
      // For other content types, create a generic element (you can extend this based on your needs)
      const genericContent = document.createElement('div');
      genericContent.textContent = 'Unsupported Content Type';
      return genericContent;
    }
  }

  // Function to get the network name
  async function getNetworkName() {
    try {
      const networkId = await web3.eth.net.getId();
      switch (networkId) {
        case 1:
          return 'Mainnet';
        case 3:
          return 'Ropsten Testnet';
        case 4:
          return 'Rinkeby Testnet';
        case 42:
          return 'Kovan Testnet';
        default:
          return 'Unknown Network';
      }
    } catch (error) {
      console.error('Error getting network ID:', error);
      return 'Unknown Network';
    }
  }
});
