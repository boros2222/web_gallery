function makeRequest (method, url) {
	return new Promise(function (resolve, reject) {

		let xhr = new XMLHttpRequest();
		xhr.open(method, url);

		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};

		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};

		xhr.send();
	});
}

let pictures = [];

makeRequest("GET", "/get/image/all")
.then(response => {
	pictures = JSON.parse(response).items;

	pictures.forEach(picture => {
		makeRequest("GET", "/get/image/" + picture)
		.then(response => {
			let wrapper = document.createElement("div");
			wrapper.innerHTML = '<img src="data:image/jpeg;base64, ' + response + '" />';
			let img = wrapper.firstChild;

			img.addEventListener("click", function() {
				let body = document.querySelector("body");
				body.style.overflow = "hidden";

				let image = new Image;
				image.onload = function() {
					document.querySelector("div.lds-roller").style.display = "none";
					document.querySelector("img.picture-view").src = this.src;
					document.querySelector("img.picture-view").style.display = "block";
				};
				image.src = "photos/" + picture;

				/* document.querySelector("img.picture-view").src = "photos/" + picture; */
				document.querySelector("div.picture-view-bg").style.top = body.scrollTop;
				document.querySelector("div.picture-view-bg").style.left = body.scrollLeft;
				document.querySelector("div.picture-view-bg").style.display = "flex";
			});

			document.querySelector("div.pictures").appendChild(img);			
		})
		.catch(err => {
			console.log(err.statusText);
		})
	});
})
.catch(err => {
	console.log(err.statusText);
})

document.querySelector("div.picture-view-bg").addEventListener("click", function() {
	if (!event.target.matches("img.picture-view")) {
		document.querySelector("body").style.overflow = "visible";
		this.style.display = "none";
		document.querySelector("div.lds-roller").style.display = "inline-block";
		document.querySelector("img.picture-view").src = "";
		document.querySelector("img.picture-view").style.display = "none";
	}
});
