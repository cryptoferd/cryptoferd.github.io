document.addEventListener('DOMContentLoaded', async () => {
  let web3;
  let accounts;

  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const rainbowizeButton = document.getElementById('rainbowizeButton');
  const resultContainer = document.getElementById('resultContainer');
  const ethscribeButton = document.getElementById('ethscribeButton');
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
  ethscribeButton.addEventListener('click', ethscribeTransaction);
  connectWalletButton.addEventListener('click', connectWallet);
  disconnectWalletButton.addEventListener('click', disconnectWallet);

  // Add an event listener to fetch and display images button
  if (fetchImagesButton) {
    fetchImagesButton.addEventListener('click', fetchAndDisplayImages);
  }

  function enableEthscribeButton() {
    ethscribeButton.removeAttribute('disabled');
  }

  // Add this function to get the network name
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

  // Modify connectWallet function to display network info
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

        // Enable ethscribe button after connecting wallet
        enableEthscribeButton();

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

  // New function to disconnect wallet
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
      // Show the Ethscribe button

      const originalWidth = imagePreview.firstChild.width;
      const originalHeight = imagePreview.firstChild.height;
      const gradientColors = Array.from(colorPickers).map(picker => picker.value);

      // Create SVG with dynamically updating background
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svg.setAttribute('width', originalWidth);
      svg.setAttribute('height', originalHeight);

      // Create a rect element for the dynamic background
      const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      backgroundRect.setAttribute('width', '100%');
      backgroundRect.setAttribute('height', '100%');
      backgroundRect.style.animation = `rainbowBackground 7s linear infinite`;

      svg.appendChild(backgroundRect);

      // Create a style element for CSS animations
      const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
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
      const imageOverlay = document.createElementNS("http://www.w3.org/2000/svg", "image");
      imageOverlay.setAttribute('x', '0');
      imageOverlay.setAttribute('y', '0');
      imageOverlay.setAttribute('width', originalWidth);
      imageOverlay.setAttribute('height', originalHeight);
      imageOverlay.setAttribute('href', imagePreview.firstChild.src);

      svg.appendChild(imageOverlay);

      // Replace the image preview with the SVG
      imagePreview.innerHTML = '';
      imagePreview.appendChild(svg);

      // Enable the Ethscribe button
      enableEthscribeButton();
    }
  }

  async function ethscribeTransaction() {
    console.log('Ethscribe button clicked!');
    if (imagePreview.firstChild) {
      try {
        const imageBase64 = imagePreview.firstChild.src.split(',')[1];

        // Convert base64 image to ArrayBuffer
        const arrayBuffer = new Uint8Array(atob(imageBase64).split('').map(char => char.charCodeAt(0))).buffer;

        // Connect to the EthScribe contract
        const ethScribe = new web3.eth.Contract(ethScribeAbi, ethScribeAddress);
        const gas = await ethScribe.methods.ethscribe(arrayBuffer).estimateGas();

        const result = await ethScribe.methods.ethscribe(arrayBuffer).send({
          from: accounts[0],
          gas: gas * 2, // Use twice the estimated gas for safety margin
        });

        console.log('EthScribe transaction result:', result);

        // Display the result
        resultContainer.textContent = `EthScribe transaction successful! Transaction hash: ${result.transactionHash}`;
        resultContainer.style.color = 'green';

      } catch (error) {
        console.error('EthScribe transaction error:', error);
        alert('Error executing EthScribe transaction. Please try again.');
      }
    } else {
      alert('Please upload an image and rainbowize it before Ethscribing.');
    }
  }

  // New function to fetch and display images
  async function fetchAndDisplayImages() {
    try {
      // Use the EthScribe contract to get the list of content URIs
      const ethScribe = new web3.eth.Contract(ethScribeAbi, ethScribeAddress);
      const contentUris = await ethScribe.methods.getAllContentUris().call();

      // Display the images in a grid
      displayImagesInGrid(contentUris);

    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Error fetching images. Please try again.');
    }
  }

  // New function to display images in a grid
  function displayImagesInGrid(imagesData) {
    // Clear existing grid content
    imageGridContainer.innerHTML = '';

    // Set the size of each grid cell
    const cellSize = 100;

    // Check if imagesData is an array
    if (Array.isArray(imagesData)) {
      // Create a grid cell for each image
      imagesData.forEach((imageData, index) => {
        const cell = document.createElement('div');
        cell.className = 'gridCell';
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        // Create an element based on the content type
        let contentElement;
        const contentType = getContentType(imageData);
        switch (contentType) {
          case 'image':
            contentElement = document.createElement('img');
            contentElement.src = imageData;
            contentElement.alt = `Image ${index + 1}`;
            break;

          // Add cases for other content types if needed

          default:
            // Handle unsupported content type
            contentElement = document.createElement('div');
            contentElement.textContent = 'Unsupported Content Type';
        }

        // Append the content element to the grid cell
        cell.appendChild(contentElement);

        // Append the grid cell to the grid container
        imageGridContainer.appendChild(cell);
      });
    } else {
      // Handle the case where imagesData is not an array
      console.error('Invalid data format. Expected an array.');
      alert('Error displaying images. Invalid data format.');
    }
  }

  // New function to determine content type based on data URI
  function getContentType(dataUri) {
    if (dataUri.startsWith('data:image/')) {
      return 'image';
    } else {
      // Add logic for other content types if needed
      return 'unknown';
    }
  }
});
