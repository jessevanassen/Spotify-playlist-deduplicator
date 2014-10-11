(function() {
	function SpotifyAPI($http, appSettings) {
		var self = this;
		var API_ENDPOINT = "https://api.spotify.com/v1";

		var getHeaders = function(authorization) {
			if (authorization == null || !authorization.isValid())
				return { };

			return {
				headers: {
					Authorization: authorization.tokenType + " " + authorization.accessToken
				}
			};
		}

		self.loadUserId = function(authorization) {
			return $http.get(API_ENDPOINT + "/me", getHeaders(authorization)).then(function(result) { return result.data.id; });
		}
	};

	angular.module("spotify-playlist-deduplicator").service("spotifyAPI", SpotifyAPI);
})();
