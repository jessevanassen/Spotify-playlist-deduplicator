(function() {
	var Authorization = function(accessToken, tokenType, expiresIn) {
		var self = this;

		self.accessToken = accessToken;
		self.tokenType = tokenType;
		self.expiresIn = expiresIn;

		self.isValid = (function() {
			var expiresAt = new Date(new Date().getSeconds() + self.expiresIn);

			return function() {
				return self.accessToken && expiresAt > new Date();
			};
		})();
	};
	Authorization.createUnauthorized = function() { return new Authorization(); };

	angular.module("spotify-playlist-deduplicator").value("Authorization", Authorization);
})();
