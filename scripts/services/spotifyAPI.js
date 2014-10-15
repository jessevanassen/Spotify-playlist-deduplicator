(function() {
	function SpotifyAPI($http, $q, appSettings) {
		var self = this;
		self._API_ENDPOINT = "https://api.spotify.com/v1";

		self._getHeaders = function(authorization) {
			var headers = {
				"Content-Type": "application/json"
			};

			if (authorization && authorization.isValid())
				headers.Authorization = authorization.tokenType + " " + authorization.accessToken;

			return headers;
		};

		self._loadAll = function(config, authorization) {
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
				url: self._API_ENDPOINT + "/me",
				params: {
					fields: "id"
				},
				headers: self._getHeaders(authorization)
			})
				.then(function(result) {
					return result.data.id;
				});
		};

		self.loadPlaylists = function(userId, authorization) {
			return self._loadAll({
				url: self._API_ENDPOINT + "/users/" + userId + "/playlists",
				params: {
					fields: ["next", "items.id", "items.name", "items.owner.id", "items.uri"].join(","),
					limit: 50
				},
				headers: self._getHeaders(authorization)
			})
				.then(function(data) {
					return {
						items: data
							.filter(function(playlist) {
								return playlist.owner.id == userId;
							})
							.map(function(playlist) {
								return new models.Playlist(
									playlist.id,
									playlist.name
								);
							})
					};
				});
		};

		self.loadTracksInPlaylist = function(userId, playlistId, authorization) {
			var snapshotId = $http({
				url: self._API_ENDPOINT + "/users/" + userId + "/playlists/" + playlistId,
				params: {
					fields: "snapshot_id"
				},
				headers: self._getHeaders(authorization)
			});
			var tracks = self._loadAll({
				url: self._API_ENDPOINT + "/users/" + userId + "/playlists/" + playlistId + "/tracks",
				params: {
					fields: ["next", "items.track.id", "items.track.uri"].join(","),
					limit: 100
				},
				headers: self._getHeaders(authorization)
			});

			return $q.all([snapshotId, tracks])
				.then(function(allData) {
					var tracks = allData[1].reduce(function(accumulator, playlistItem) {
						if (!accumulator[playlistItem.track.id])
							accumulator[playlistItem.track.id] = new models.Track(playlistItem.track.id);
						return accumulator;
					}, {});

					return {
						snapshotId: allData[0].data.snapshot_id,
						items: allData[1]
							.map(function(playlistItem) {
								return tracks[playlistItem.track.id];
							})
					};
				});
		};

		self.findDuplicateTracks = function(tracks) {
			var occurrences = tracks.reduce(function(accumulator, item, index) {
				if (accumulator[item])
					accumulator[item].index.push(index);
				else
					accumulator[item] = { track: item, index: [index] };
				return accumulator;
			}, {});
			return Object.keys(occurrences)
				.reduce(function(accumulator, id) {
					if (occurrences[id].index.length > 1)
						accumulator.push(occurrences[id]);
					return accumulator;
				}, []);
		}
	}

	angular.module("spotify-playlist-deduplicator").service("spotifyAPI", SpotifyAPI);
})();
