models.Playlist = function(id, name) {
	var self = this;

	self.getId = function() { return id; };
	self.getName = function() { return name; };
};
