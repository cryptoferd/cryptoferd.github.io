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

  async function ethscribeTransaction() {
    if (imageInput.files.length === 0) {
      alert('Please upload an image before ethscribing.');
      return;
    }

    const file = imageInput.files[0];
    const content = await getFileContent(file);

    if (content) {
      const ethscribeContract = new web3.eth.Contract(ethscribeAbi, ethscribeAddress);

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 300000;

      const transactionParameters = {
        from: accounts[0],
        gas: gasLimit,
        gasPrice: gasPrice,
        data: ethscribeContract.methods.ethscribe(content).encodeABI(),
      };

      try {
        const transactionHash = await web3.eth.sendTransaction(transactionParameters);
        console.log('Transaction hash:', transactionHash);
        alert('Ethscription successful! Transaction hash: ' + transactionHash);

        // Clear the image input and result container after ethscribing
        imageInput.value = '';
        resultContainer.innerHTML = '';
      } catch (error) {
        console.error('Error sending transaction:', error);
        alert('Error ethscribing. Please try again.');
      }
    }
  }

  async function getFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = function () {
        const content = reader.result.split(',')[1]; // Exclude the data URI scheme
        resolve(content);
      };

      reader.onerror = function (error) {
        console.error('Error reading file:', error);
        reject(null);
      };

      reader.readAsDataURL(file);
    });
  }

  async function fetchAndDisplayImages() {
    try {
      // Fetch data from the API using the current connected wallet address
      const ethAddress = accounts[0]; // Assuming accounts[0] contains the current connected wallet address
      const apiUrl = `https://api.wgw.lol/v1/mainnet/profiles/${ethAddress}/owned`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Check if the data has the expected structure
      if (data && data.total_count && data.total_count > 0 && data.items) {
        // Display images in the grid
        displayImagesInGrid(data.items);
      } else {
        console.error('Invalid data format. Expected structure not found.');
        alert('Error fetching and displaying images. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching and displaying images:', error);
      alert('Error fetching and displaying images. Please try again.');
    }
  }

  // Updated function to display images in a grid
  function displayImagesInGrid(imagesData) {
    const gridContainer = document.getElementById('imageGridContainer');

    // Clear existing grid content
    gridContainer.innerHTML = '';

    // Set the size of each grid cell
    const cellSize = 100;

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
    });
  }

  // New function to create content element based on data URI
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
});
