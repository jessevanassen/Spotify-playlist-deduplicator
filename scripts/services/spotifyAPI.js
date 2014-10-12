(function() {
	function SpotifyAPI($http, $q, appSettings) {
		var self = this;
		var API_ENDPOINT = "https://api.spotify.com/v1";

		var getHeaders = function(authorization) {
			var headers = {
				"Content-Type": "application/json"
			};

			if (authorization && authorization.isValid())
				headers.Authorization = authorization.tokenType + " " + authorization.accessToken;

			return headers;
		};

		var loadAll = function(config, authorization) {
			var deferred = $q.defer();

			var load = function(config, accumulator) {
				$http(config)
					.then(function(result) {
						accumulator = accumulator.concat(result.data.items);
						if (result.data.next) {
							load({
								url: result.data.next,
								headers: config.headers
							}, accumulator);
						} else {
							deferred.resolve(accumulator);
						}
					})
					.catch(deferred.reject);
			};
			load(config, []);

			return deferred.promise;
		};

		self.loadUserId = function(authorization) {
			return $http({
				url: API_ENDPOINT + "/me",
				params: {
					fields: "id"
				},
				headers: getHeaders(authorization)
			})
				.then(function(result) {
					return result.data.id;
				});
		};

		self.loadPlaylists = function(userId, authorization) {
			return loadAll({
				url: API_ENDPOINT + "/users/" + userId + "/playlists",
				params: {
					fields: ["next", "items.id", "items.name", "items.owner.id", "items.uri"].join(","),
					limit: 50
				},
				headers: getHeaders(authorization)
			})
				.then(function(data) {
					return {
						items: data
							.filter(function(playlist) {
								return playlist.owner.id == userId;
							})
							.map(function(playlist) {
								return {
									id: playlist.id,
									name: playlist.name,
									uri: playlist.uri
								};
							})
					};
				});
		};

		self.loadTracksInPlaylist = function(userId, playlistId, authorization) {
			var snapshotId = $http({
				url: API_ENDPOINT + "/users/" + userId + "/playlists/" + playlistId,
				params: {
					fields: "snapshot_id"
				},
				headers: getHeaders(authorization)
			});
			var tracks = loadAll({
				url: API_ENDPOINT + "/users/" + userId + "/playlists/" + playlistId + "/tracks",
				params: {
					fields: ["next", "items.track.id", "items.track.uri"].join(","),
					limit: 100
				},
				headers: getHeaders(authorization)
			});

			return $q.all([snapshotId, tracks])
				.then(function(allData) {
					return {
						snapshotId: allData[0].data.snapshot_id,
						items: allData[1]
							.map(function(playlistItem) {
								return {
									id: playlistItem.track.id,
									uri: playlistItem.track.uri
								};
							})
					};
				});
		};
	}

	angular.module("spotify-playlist-deduplicator").service("spotifyAPI", SpotifyAPI);
})();
