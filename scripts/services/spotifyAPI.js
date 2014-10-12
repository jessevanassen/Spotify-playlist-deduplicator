(function() {
	function SpotifyAPI($http, $q, appSettings) {
		var self = this;
		var API_ENDPOINT = "https://api.spotify.com/v1";

		var getHeaders = function(authorization) {
			if (authorization === undefined || authorization === null || !authorization.isValid())
				return { };

			return {
				headers: {
					Authorization: authorization.tokenType + " " + authorization.accessToken
				}
			};
		};

		var loadAll = function(url, authorization) {
			var deferred = $q.defer();

			var loadAll_ = function(url, accumulator) {
				$http.get(url, getHeaders(authorization))
					.then(function(result) {
						accumulator = accumulator.concat(result.data.items);
						if (result.data.next)
							loadAll_(result.data.next, accumulator);
						else
							deferred.resolve(accumulator);
					})
					.catch(deferred.reject);
			};
			loadAll_(url, []);

			return deferred.promise;
		};

		self.loadUserId = function(authorization) {
			return $http.get(API_ENDPOINT + "/me", getHeaders(authorization)).then(function(result) { return result.data.id; });
		};

		self.loadPlaylists = function(userId, authorization) {
			return loadAll(API_ENDPOINT + "/users/" + userId + "/playlists?offset=0&limit=50", authorization).then(function(data) {
				return data.map(function(playlist) { return { id: playlist.id, name: playlist.name }; });
			});
		};
	}

	angular.module("spotify-playlist-deduplicator").service("spotifyAPI", SpotifyAPI);
})();
