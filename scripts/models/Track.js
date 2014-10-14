models.Track = function(id) {
	var self = this;

	self.getId = function() { return id; };
	self.getUri = function() { return "spotify:track:" + id; };
};
