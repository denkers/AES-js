<img src="preview/Logo.png" align="left" class="preview-logo preview-logo-strict" />

# AES JS Library

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

aes-lib-js is a comprehensive [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) library that includes a complete Javascript implementation of AES/Rijndael  
The library supports all 128/192/256 key size versions of the AES algorithm  
By default the library runs AES in CBC mode but can be easily implemented in other modes  
Notable projects using aes-lib-js include [ByteChat](https://github.com/kyleruss/byte-chat) and [SafeExchange](https://github.com/kyleruss/safe-exchange). 
The repository also includes a research [document](AESAppliedInWebTechnology.pdf) that was written for this work and outlines in depth the AES algorithm and how it can be applied in the web landscape

## Usage
#### Encrypting a Message
The following function can be used to encrypt your plain-text message  
You will need to input the plain-text string, a private key string (or state matrix type), an Initial Vector string (or state matrix type) and the size of the key (128/192/256 bits)

```
var encryptedMessage  =  AES.encryptMessage(message, privateKey, iv, 128);
```

**Note:** State matrices in aes-lib-js are auxilery data structures and are essentially wrappers for 2D arrays  
You can transform a string into a state matrix using `Structure.strToState(message);` or transform  
hex into a state matrix with `Structure.hexToState(message);`  

#### Decrypting a Message
The following function can be used to decrypt an encrypted message
The encrypted string, private key, initial vector and key size will need to be input
The function will decrypt the message and return the plain-text string

```
var decryptedMessage  =  AES.decryptMessage(encryptedMessage, privateKey, iv, 128);
```

## Installation
- Clone the aes-lib-js repository
```
git clone https://github.com/kyleruss/aes-lib-js.git
```

- Move the scripts into your project
- Include the aes-lib-js scripts in your project
```
<script src="Structure.js"></script>
<script src="Engine.js"></script>
<script src="KeySchedule.js"></script>
<script src="AES.js"></script>
```

## License
aes-lib-js is available under the MIT License  
See [LICENSE](LICENSE) for more details
