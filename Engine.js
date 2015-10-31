function Engine() {}

//Byte substitution layer
//Substitute each state entry with the corresponding sbox entry
//state: 4x4 state matrix
//encrypt_mode: bool, pass true/false for encrypting/decrypting
//decryption subtitutes bytes from Structure.inverseSbox
Engine.byteSub = function(state, encrypt_mode)
{
	for(row = 0; row < 4; row++)
	{
		for(col = 0; col < 4; col++)
		{
			//decryption subtitutes bytes from Structure.inverseSbox
			//encryption substitutes bytes from Structure.sbox
			state[row][col] = Structure.getSboxEntryFromBin(state[row][col], encrypt_mode);
		}
	}
};


//Shift rows layer
//encryption: shifts rows 1..4 by 3..1 positions right
//decryption: shifts rows 1..4 by 1..3 positions right
//state: 4x4 state matrix
//encrypt_mode: bool, pass true/false for encrypting/decrypting
Engine.shiftRows = function(state, encrypt_mode)
{
	//shift rows 1..4 in state 3..1 positions right
	if(encrypt_mode)
	{
		for(numPositions = 3, row = 1; numPositions > 0; numPositions--, row++)
			Engine.shiftRow(state[row], numPositions);
	}

	//shift rows 1..4 in state 1..3 positions right
	else
	{
		for(numPositions = 1, row = 1; numPositions <= 3; numPositions++, row++)
			Engine.shiftRow(state[row], numPositions);
	}
};

//Shifts the passed row numPositions right
//row: array to shift
//numPositions: number of positions to shift each position right
Engine.shiftRow = function(row, numPositions)
{
	//copy shifted positions into temp
	//-------------------------------------------
	var temp = [];
	for(i = 0; i < 4; i++)
	{
		var index	= (i + numPositions) % 4;
		temp[index] = row[i];
	}
	//-------------------------------------------

	//Copy temp with shifted positions into row
	row.splice.apply(row, [0, 4].concat(temp));
};






