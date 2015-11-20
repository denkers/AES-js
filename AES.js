function AES() {}

//Encrypts the passed state block
//passed state is mutated with encrypted state
//state: 128bit block: 4x4 state matrix
//keyScheudle: loaded KeySchedule with your pkey
//keySize: length of pkey: 128/192/256
AES.encryptBlock = function(state, keySchedule, keySize)
{
	//Add round 0 key
	//------------------------------------	
	var roundKey = keySchedule.getKey(0);
	Structure.addStates(state, roundKey);
	//------------------------------------
	
	//Perform internals for numRounds
	var numRounds = AES.getNumRounds(keySize);
	for(var round = 1; round <= numRounds; round++)
	{
		//Byte substitution layer
		//Confusion component
		Engine.byteSub(state, true);


		//Difussion components
		//-----------------------------------------
		//Shift rows layer
		Engine.shiftRows(state, true);

		//Mix columns layer
		//Only performed on rounds 1..numRounds-1
		if(round != numRounds)
			Engine.mixColumns(state, true);
		//-----------------------------------------
		
		
		//Add round key to state
		roundKey = keySchedule.getKey(round);
		Structure.addStates(state, roundKey);
	}
};


//Encrypts the passed state blocks in CBC mode
//states:	state matrice(s) to be encrypted
//key:		your private key (KeySchedule loaded inside)
//iVector:	initial vector, 128bit state matrix
//keySize:	length of key: 128/192/256
AES.encryptCBC = function(states, key, iVector, keySize)
{
	var schedule	=	new KeySchedule(key, 10);
	var numBlocks	=	states.length;

	//Make numBlocks cipher-text blocks
	for(var i = 0; i < numBlocks; i++)
	{
		//create input block
		//-------------------------------------------------
		//xor initial vector on first plain-text block
		if(i == 0)
			Structure.addStates(states[0], iVector);

		//xor previous output block
		else
			Structure.addStates(states[i], states[i - 1]);

		//-------------------------------------------------
	
			
		//encrypt input block to make cipher block
		AES.encryptBlock(states[i], schedule, keySize);
	}

	return states;
};


//Decrypts the passed state block
//passed state is mutated with decrypted state
//state:		128bit block/4x4 state matrix
//keySchedule:	loaded KeySchedule with pkey
//keySize:		pkey length: 128/192/256
AES.decryptBlock = function(state, keySchedule, keySize)
{
	var roundKey;
	var numRounds	=	AES.getNumRounds(keySize);


	//Perform inverse internals for numRounds
	for(var round = numRounds; round > 0; round--)
	{
		//Add round key to state
		roundKey = keySchedule.getKey(round);
		Structure.addStates(state, roundKey);


		//Difussion components
		//-----------------------------------------
		//Inverse mix columns layer
		//Only performed on rounds 1..numRounds-1
		if(round != numRounds)
			Engine.mixColumns(state, false);

		//Inverse shift rows layer
		Engine.shiftRows(state, false);
		//-----------------------------------------


		//Confusion component
		//Inverse byte substiution layer
		Engine.byteSub(state, false);
	}

	//Add round 0 key
	//-----------------------------------------
	roundKey = keySchedule.getKey(0);
	Structure.addStates(state, roundKey);
	//-----------------------------------------
};


//Encrypts the passed plain text in CBC mode
//returns the encrypted states matrice(s)
//use encryptMessage over encryptCBC for arbtitrary plainStr length
//plainStr:		plain text to be encrypted
//key:			private key => string OR state matrix
//iVector:		initial vector => string or state matrix
//keySize:		length of private key 128/192/256
AES.encryptMessage = function(plainStr, key, iVector, keySize)
{
	//Invalid encryption input
	if(plainStr.length == 0 || AES.getNumRounds(keySize) == 0 || iVector.length > 16) return;

	var keyState, iVectorState;
	var states				=	Structure.makeStates(plainStr);

	//key or initial vector may be passed as string or state matrix
	//creates their respective matrices and sets iVectorState & keyState
	//-------------------------------------------------------------------
	//key and initial vector are passed strings
	//create their state matrices
	if(!(iVector instanceof Array) && !(key instanceof Array))
	{
		iVectorState		=	Structure.strToState(iVectorStr);
		keyState			=	Structure.strToState(keyStr);
	}

	//key and initial vector are state matrices 
	//set iVectorState & keyState
	else
	{
		iVectorState		=	iVector;
		keyState			=	key;
	}
	//-------------------------------------------------------------------


	//encrypt state(s) in cbc mode
	//returns the state(s)
	AES.encryptCBC(states, keyState, iVectorState, keySize);
	return states;
};


//Decrypts the passed states in CBC mode
//mutates the passed cipherStates into decrypted states
//use decryptCBC if your key/initial vector are state matrices
//states:		encrypted state matrice(s)
//keyStr:		128bit/16 length private key string
//iVectorStr:	128bit/16 length initial vector string
//keySize:		length of private key: 128/192/256
AES.decryptMessage = function(states, key, iVector, keySize)
{
	//Invalid decryption input
	if(states.length == 0 || AES.getNumRounds(keySize) == 0 || iVector.length > 16) return;

	//Create iVector & key state matrices
	var iVectorState, keyState;

	//key or initial vector may be passed as string or state matrix
	//creates their respective matrices and sets iVectorState & keyState
	//-------------------------------------------------------------------
	//key and initial vector are passed strings
	//create their state matrices
	if(!(iVector instanceof Array) && !(key instanceof Array))
	{
		iVectorState		=	Structure.strToState(iVector);
		keyState			=	Structure.strToState(key);
	}

	//key and initial vector are state matrices 
	//set iVectorState & keyState
	else
	{
		iVectorState		=	iVector;
		keyState			=	key;
	}
	//-------------------------------------------------------------------

	//Decrypt the encrypted states in CBC mode
	//states will be muted into decrypted states
	AES.decryptCBC(states, keyState, iVectorState, keySize);
	return Structure.statesToString(states);
};



//Decrypts the passed states in CBC mode
//mutates the passed cipherStates into decrypted states
//use over decryptMessage if key/iVector are matrices
//states:		encrypted state matrice(s)
//keyStr:		private key state matrix
//iVectorStr:	initial vector state matrix
//keySize:		length of private key: 128/192/256
AES.decryptCBC = function(states, key, iVector, keySize)
{
	var cipherBlocks		=	[[[]]];
	var numBlocks			=	states.length;
	var schedule			=	new KeySchedule(key, 10);

	//store the cipher text blocks before mutation
	//-------------------------------------------------
	for(var i = 0; i < numBlocks; i++)
	{
		var temp = Structure.createState();
		for(var row = 0; row < 4; row++)
			temp[row] = states[i][row].slice(0);
		
		cipherBlocks[i] = temp;
	}
	//-------------------------------------------------

	
	//create numBlocks plain-text blocks in cbc mode
	for(i = 0; i < numBlocks; i++)
	{
		//decrypt input cipher block
		//creates output block i
		AES.decryptBlock(states[i], schedule, keySize);


		//create plain text block i
		//-------------------------------------------------
		//xor initial vector on first block
		if(i == 0)
			Structure.addStates(states[0], iVector);
		
		//xor previous cipher-text block
		else
			Structure.addStates(states[i], cipherBlocks[i - 1]);
		//-------------------------------------------------

	}
};


//Returns the number of internal rounds 
//-needed for the passed keySize
//keySize: bit length of private key
//recognizes 128/192/256 bit length keys
AES.getNumRounds = function(keySize)
{
	switch(keySize)
	{
		case 128:
			return 10;
		
		case 192:
			return 12;

		case 256:
			return 14;

		default:
			return 0;
	}
};
