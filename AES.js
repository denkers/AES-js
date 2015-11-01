function AES() {}

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
};



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


AES.encryptMessage = function(plainStr, key, iVector, keySize)
{
	if(plainStr.length == 0 || AES.getNumRounds(keySize) == 0 || iVector.length > 16) return;

	var keyState, iVectorState;
	if(!(iVector instanceof Array) && !(key instanceof Array))
	{
		iVectorState		=	Structure.strToState(iVectorStr);
		keyState			=	Structure.strToState(keyStr);
	}

	else
	{
		iVectorState		=	iVector;
		keyState			=	key;
	}

	var states			=	Structure.makeStates(plainStr);
	AES.encryptCBC(states, keyState, iVectorState, keySize);
	return states;
};


AES.decryptMessage = function(cipherStates, keyStr, iVectorStr, keySize)
{
	if(cipherStates.length == 0 || AES.getNumRounds(keySize) == 0 || iVectorStr.length > 16) return;

	var iVector		=	Structure.strToState(iVectorStr);
	var key			=	Structure.strToState(keyStr); 

	AES.decryptCBC(cipherStates, key, iVector, keySize);
	return states;
};


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
