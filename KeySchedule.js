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

};


KeySchedule.prototype.rotate = function(word)
{
	
};


KeySchedule.prototype.core = function(word, i)
{


};


KeySchedule.prototype.addRoundCoeff = function(entry, i)
{


};



KeySchedule.prototype.getKey = function(roundNum)
{

};


KeySchedule.prototype.getNumSubkeys = function()
{
	return this.numSubkeys;
};
