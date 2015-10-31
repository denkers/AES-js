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



AES.encrypt_cbc = function(states, key, keySize)
{

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


AES.decrypt_cbc = function(state, keySchedule, keySize)
{

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
