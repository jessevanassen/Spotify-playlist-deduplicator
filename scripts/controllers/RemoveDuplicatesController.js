(function() {
	var module = angular.module("spotify-playlist-deduplicator");
	module.controller("Controller", function($scope, $http, $q, spotifyAPI, appSettings) {
		function getAuthorization() {
			var match = /#access_token=((?:\w|\-)+)&token_type=(\w+)&expires_in=(\d+)/.exec(window.location.hash);
			if (match)
				return new models.Authorization(
					match[1],
					match[2],
					match[3]
				);
			else
				return models.Authorization.createUnauthorized();
		}

		function authorize() {
			window.location = "https://accounts.spotify.com/authorize?client_id=" + appSettings.clientId + "&redirect_uri=" + appSettings.redirectUri + "&response_type=token&show_dialog=false&scope=" + ["playlist-read-private", "playlist-modify-public", "playlist-modify-private"].join("%20");
		}

		function createCheckedList(list) {
			return list.map(function(item) {
				return {
					checked: false,
					item: item
				};
			});
		}

		function getCheckedItems(checkedList) {
			return checkedList
				.filter(function(item) {
					return item.checked === true;
				})
				.map(function(item) {
					return item.item;
				});
		}

		function removeDuplicatesFromPlaylists(playlists) {
			var removeDuplicateFromPlaylist = function(playlist) {
				return spotifyAPI.removeDuplicateTracksInPlaylist(userId, playlist.getId(), authorization);
			};

			return $q.all(
				playlists.map(removeDuplicateFromPlaylist)
			)
			.then(function(data) {
				return playlists.filter(function(_, i) {
					return data[i] === true;
				});
			});
		}

		$scope.busy = true;
		$scope.playlists = [];
		$scope.notifications = [];

		var userId;
		var playlists;

		var authorization = getAuthorization();
		if(!authorization.isValid())
			authorize();

		spotifyAPI.loadUserId(authorization)
			.then(function(userId_) {
				userId = userId_;
				return spotifyAPI.loadPlaylists(userId, authorization);
			})
			.then(function(data) {
				playlists = data.items;
				$scope.playlists = createCheckedList(playlists);
				$scope.busy = false;
			})
			.catch(function(reason) {
				if (reason.status === 401) {
					authorize();
				}
			});

		$scope.hasCheckedPlaylists = function() {
			return $scope.playlists.some(function(item) {
				return item.checked === true;
			});
		};

		$scope.removeDuplicates = function() {
			$scope.busy = true;
			removeDuplicatesFromPlaylists(getCheckedItems($scope.playlists))
				.then(function(data) {
					if (data.length > 0) {
						$scope.notifications.unshift({
							template: "duplicate_tracks_removed",
							playlists: data.map(function(playlist) { return playlist.getName(); })
						});
					} else {
						$scope.notifications.unshift({ template: "no_tracks_removed" });
					}
				})
				.catch(function(reason) {
					if (reason.status === 401) {
						authorize();
					}
				})
				.finally(function() {
					$scope.busy = false;
				});
		};
	});
})();