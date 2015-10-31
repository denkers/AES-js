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
	for(round = 1; round <= numRounds; round++)
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



AES.encrypt_cbc = function(states, key, iVector, keySize)
{
	var schedule	=	new KeySchedule(key);
	var numBlocks	=	states.length;

	//Make numBlocks cipher-text blocks
	for(i = 0; i < numBlocks; i++)
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
	for(round = numRounds; round > 0; round--)
	{
		//Add round key to state
		roundKey = schedule.getKey(round);
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
};


AES.decrypt_cbc = function(states, key, iVector, keySize)
{
	var cipherBlocks		=	Structure.createState();
	var numBlocks			=	states.length;
	var schedule			=	new KeySchedule(key);

	//store the cipher text blocks before mutation
	//-------------------------------------------------
	for(i = 0; i < numBlocks; i++)
		cipherBlocks[i] = states[i];
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
			Structure.addStates(states[i], iVector);
		
		//xor previous cipher-text block
		else
			Structure.addStates(states[i], iVector);
		//-------------------------------------------------

	}
}


AES.getNumRounds(keySize)
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
}
