models.Authorization = function(accessToken, tokenType, expiresIn) {
	var self = this;

	self.accessToken = accessToken;
	self.tokenType = tokenType;
	self.expiresIn = expiresIn;

	self.isValid = (function() {
		var expiresAt = new Date(new Date().getTime() + self.expiresIn * 1000);

		return function() {
			return self.accessToken && expiresAt > new Date();
		};
	})();
};
models.Authorization.createUnauthorized = function() { return new models.Authorization(); };
