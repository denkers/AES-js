function Engine() {}

//Byte substitution layer
//Substitute each state entry with the corresponding sbox entry
//state: 4x4 state matrix
//encrypt_mode: bool, pass true/false for encrypting/decrypting
//decryption subtitutes bytes from Structure.inverseSbox
Engine.byteSub = function(state, encrypt_mode)
{
	for(var row = 0; row < 4; row++)
	{
		for(var col = 0; col < 4; col++)
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
	var numPositions;
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
	for(var i = 0; i < 4; i++)
	{
		var index	= (i + numPositions) % 4;
		temp[index] = row[i];
	}
	//-------------------------------------------

	//Copy temp with shifted positions into row
	row.splice.apply(row, [0, 4].concat(temp));
};



//Mix columns layer
Engine.mixColumns = function(state, encrypt_mode)
{
	//Perform the multiplication of the state and mixColmatrix 
	//Copy the product in temp
	var temp = Structure.createState();
	for(var row = 0; row < 4; row++)
	{
		for(var col = 0; col < 4; col++)
		{
			temp[col][row]	= 
				Structure.xor
  				(
					Engine.mixMultiply(state[0][row], Structure.getMixColEntry(col, 0, encrypt_mode)),
					Engine.mixMultiply(state[1][row], Structure.getMixColEntry(col, 1, encrypt_mode))
		  		);

			temp[col][row] = Structure.xor(temp[col][row], Engine.mixMultiply(state[2][row], Structure.getMixColEntry(col, 2, encrypt_mode)));
			temp[col][row] = Structure.xor(temp[col][row], Engine.mixMultiply(state[3][row], Structure.getMixColEntry(col, 3, encrypt_mode)));	
		}
	}

	Structure.copyState(state, temp);
};


Engine.mixMultiply = function(stateEntry, mixEntry)
{
	var mixHex		=	Structure.padHex(Structure.convert(mixEntry, 2, 16));
	var stateHex	=	Structure.padHex(Structure.convert(stateEntry, 2, 16));
	var product;

	//mix col entry is <= 3
	//skip peasants algorithm
	if(mixHex <= 3)
	{
		//multiply by 1 is identity
		if (mixHex == '01')
			return stateEntry;

		//multiply by x (left shift 1)
		product = Structure.shiftLeft(stateEntry, 1);

		if (mixHex == '03')
			product = Structure.xor(product, stateEntry); 

		//left most bit is set (carry)
		if (stateEntry.charAt(0) == '1')
			product = Structure.xor(product, Structure.convert('1b', 16, 2));

		return product;
	}

	//mix col entry is > 3
	//use peasants algorithm to get product
	else
	{ 
		if (mixHex == 0 || stateHex == 0)
			return Structure.padBin("");

		var a, b, carry;
		a		=	stateEntry;
		b		=	mixEntry;
		product =	Structure.padBin("");

		for (var i = 0; i < 8; i++)
		{
			//if rightmost bit of b is 1, xor product and a
			if (b.charAt(7) == '1')
				product = Structure.xor(product, a);

			//shift b 1 bit right
			b = Structure.shiftRight(b, 1);

			//set carry before shifting a
			//carry is true if leftmost bit of a is set
			carry = (a.charAt(0) == '1');

			//shift a 1 bit left
			a = Structure.shiftLeft(a, 1);

			//carrying bit, xor a with 0x1b
			if (carry)
				a = Structure.xor(a, Structure.convert('1b', 16, 2));
		}

		return product;
	
	}
};




