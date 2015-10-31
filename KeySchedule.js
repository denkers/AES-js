function KeySchedule(key, numRounds)
{
	if(numRounds > 0)
	{
		this.numSubkeys =	numRounds + 1;
		this.schedule	=	[];
		this.initKeys(key);
	}
}

KeySchedule.prototype.initKeys = function(key)
{
	//set first 16 bytes of schedule as private key
	for(col = 0; col < 4; col++)
	{
		var colBytes			=	Structure.getColumn(key, col);
		schedule[col * 4]		=	colBytes[0];
		schedule[col * 4 + 1]	=	colBytes[1];
		schedule[col * 4 + 2]	=	colBytes[2];
		schedule[col * 4 + 3]	=	colBytes[3];
	}

	var keyLen	=	16; //fixed size of the key
	var front	=	16; //schedule index
	var i		=	1; //rcon index 
	var schSize	=	numSubkeys * 16; //size of the schedule

	while(front < schSize)
	{
		//next 4 bytes of key to be added to schedule
		var next	=	[];

		//copy previous 4 bytes into next
		for(j = 0, k = (front - 4); j < 4; j++, k++)
			next[j] = schedule[k];

		//perform the core operations on next and incr i
		//core is performed every keyLen bytes of key
		if(front % keyLen == 0)
		{
			this.core(next, i);
			i++;
		}

		//set next 4 bytes of schedule as next xor with the prev 16 bytes, 4 byte block
		//increments front
		for(j = 0; j < 4; j++, front++)
			schedule[front] = Structure.xor(schedule[front - keyLen], next[j]);
	}
};

//circular left shift the word by 1 byte
KeySchedule.prototype.rotate = function(word)
{
	var temp = word[0];
	for(i = 0; i < 3; i++)
		word[i] = word[i + 1];

	word[3] = temp;
};


//performs the keyschedule core operations
//rotates the word
//applies the sbox
//xors the rcon entry on word
KeySchedule.prototype.core = function(word, i)
{
	//rotate word left 1 byte
	this.rotate(word);

	//apply s-box on word
	//uses Structure.sbox for both encrypt/decrypt
	for(j = 0; j < 4; j++)
		word[j]	=	Structure.getSboxEntryFromBin(word[j], true);

	//add round coefficient to left most byte of word
	this.addRoundCoeff(word[0], i);
};


//xors entry with the rcon entry at index i
KeySchedule.prototype.addRoundCoeff = function(entry, i)
{
	var rconEntry	=	Structure.getRconEntry(i);
	return Structure.xor(entry, rconEntry);
};


//returns a key in the schedule for the round at roundNum
KeySchedule.prototype.getKey = function(roundNum)
{
	var key		=	Structure.createState();	
	var sIndex	=	(roundNum * 16);

	//copy round key into key
	for(row = 0; row < 4; row++)
		for(col = 0; col < 4; col++)
			key[col][row] = this.schedule[sIndex++];

	return key;
};


KeySchedule.prototype.getNumSubkeys = function()
{
	return this.numSubkeys;
};
