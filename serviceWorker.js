importScripts('assets/js/cache-polyfill.js');

var CACHE_NAME = "calculator";

self.addEventListener('install', function(event) {
	
});

self.addEventListener('activate', function(event) {

	event.waitUntil((function(){
		caches.keys().then(function(cacheNames){
			return Promise.all(
				cacheNames.map(function(cache) {
					if(cache !== CACHE_NAME)
						return caches.delete(cache);
				})
			);
		})
		
	})());

	event.waitUntil((() => {clients.claim()})());
})

self.addEventListener('fetch', function(e) {
	//console.log("Service Worker: fetching");

	e.respondWith(
		fetch(e.request).then(function(res){
			if(res.status != 200)
				return res;
			

			return caches.open(CACHE_NAME).then(function(cache){
				cache.put(e.request,res.clone());
				return res;

			}).catch(function(cacheErr){
				console.error("Cache Error: "+cacheErr);
			})

		}).catch(function(err){
			return caches.open(CACHE_NAME).then(function(cache){
				return cache.match(e.request).then(function(res){
					return res;
				});
			})
		})
	);
});