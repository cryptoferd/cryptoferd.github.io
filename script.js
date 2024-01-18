document.addEventListener('DOMContentLoaded', () => {
  let web3;
  let accounts;

  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const rainbowizeButton = document.getElementById('rainbowizeButton');
  const resultContainer = document.getElementById('resultContainer');
  const ethscribeButton = document.getElementById('ethscribeButton');
  const connectWalletButton = document.getElementById('connectWalletButton');
  const disconnectWalletButton = document.getElementById('disconnectWalletButton'); // Added disconnect button
  const colorPickers = document.querySelectorAll('.color-picker');

  imageInput.addEventListener('change', handleImageUpload);
  rainbowizeButton.addEventListener('click', rainbowizeImage);
  ethscribeButton.addEventListener('click', ethscribeTransaction);
  connectWalletButton.addEventListener('click', connectWallet);
  disconnectWalletButton.addEventListener('click', disconnectWallet); // Added event listener for disconnect button

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
      imageOverlay.setAttribute('xlink:href', imagePreview.firstChild.src);
      imageOverlay.style.imageRendering = 'pixelated';
  
      // Apply image overlay to SVG
      svg.appendChild(imageOverlay);
  
      // Display the result
      resultContainer.innerHTML = '';
      resultContainer.appendChild(svg);
  
      // Show Connect Wallet button and hide Disconnect Wallet button
      connectWalletButton.style.display = 'block';
      disconnectWalletButton.style.display = 'none';
  
      // Generate and display the base64 data URI
      const svgContent = new XMLSerializer().serializeToString(svg);
      const dataUri = 'data:image/svg+xml;base64,' + btoa(svgContent);
  
      // Convert Data URI to hexadecimal
      const hexData = stringToHex(dataUri);
  
      // Create a new element to display the hexadecimal data
      const hexDataElement = document.createElement('div');
      hexDataElement.textContent = 'Hexadecimal Data: ' + hexData;
  
      // Append the hexadecimal data element to the result container
      resultContainer.appendChild(hexDataElement);
    } else {
      alert('Please upload an image first.');
    }
  }
  
  async function ethscribeTransaction() {
    console.log('Ethscribe button clicked!');
    console.log('Web3:', web3);
    console.log('Accounts:', accounts);
    console.log('Image Preview:', imagePreview.firstChild);

    if (web3 && accounts && imagePreview.firstChild) {
      const gradientColors = Array.from(colorPickers).map(picker => picker.value);

      // Generate and display the base64 data URI
      const svgContent = new XMLSerializer().serializeToString(resultContainer.firstChild);
      const dataUri = 'data:image/svg+xml;base64,' + btoa(svgContent);

      // Convert Data URI to hexadecimal
      const hexData = stringToHex(dataUri);

      console.log('Hex Data:', hexData);

      try {
        // Create Ethereum transaction
        const transactionParameters = {
          from: accounts[0],
          to: accounts[0], // Sending to your own address
          value: '0x0', // No value attached (sending to yourself)
          data: '0x' + hexData, // Hex data of the generated image
        };

        console.log('Transaction Parameters:', transactionParameters);

        // Send Ethereum transaction
        const transactionHash = await web3.eth.sendTransaction(transactionParameters);

        console.log('Transaction Hash:', transactionHash);

        // Display success message or handle transactionHash as needed
        alert(`Transaction sent successfully! Transaction Hash: ${transactionHash}`);
      } catch (error) {
        console.error(error);
        alert('Error sending transaction. Please check the console for details.');
      }
    } else {
      alert('Please connect your wallet and generate an image first.');
    }
  }

  function stringToHex(string) {
    let hex = '';
    for (let i = 0; i < string.length; i++) {
      hex += string.charCodeAt(i).toString(16);
    }
    return hex.toUpperCase();
  }
});
