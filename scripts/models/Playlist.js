models.Playlist = function(id, name, uri) {
	var self = this;

	self.getId = function() { return id; };
	self.getName = function() { return name; };
	self.getUri = function() { return uri; };
	self.toString = self.getUri;
};
