function query() {
    var text = document.getElementById("query-input").value;

    var request = "https://api.themoviedb.org/3/search/multi?api_key=af3af3fa226455dbdb23a95f0b6df146&language=en-US&page=1&include_adult=false&query=" + encodeURIComponent(text);

    var table = document.getElementById("results");
    var warning = document.getElementById("warning");
    table.innerHTML = "";

    sendRequest(request, response => {
        var length = response.results.length;
        if (length != 0) {
            table.removeAttribute("hidden");
            warning.setAttribute("hidden", "");
            response.results.slice(0, 10).reverse().forEach(result => {
                if (result.media_type == "movie" || result.media_type == "tv") {
                    var row = table.insertRow(0);
                    var nameCell = row.insertCell(0);
                    var dateCell = row.insertCell(1);

                    nameCell.classList.add("name-column");
                    dateCell.classList.add("date-column");

                    if (result.media_type == "movie") {
                        nameCell.innerHTML = result.title;

                        var detailsRequest = "https://api.themoviedb.org/3/movie/" + result.id + "?api_key=af3af3fa226455dbdb23a95f0b6df146&language=en-US";
                        sendRequest(detailsRequest, response => {
                            nameCell.innerHTML = homepageLink(result.title, response.homepage);
                        });

                        var date = result.release_date;
                        if (date == "") {
                            date = "Not yet announced.";
                        } else {
                            var dateObj = new Date(date);
                            var now = Date.now();
                            if (dateObj > now)
                                date = formatDate(dateObj);
                            else
                                date = "Already released!";
                        }
                        dateCell.innerHTML = date;
                    } else {
                        nameCell.innerHTML = result.name;
                        dateCell.innerHTML = "";

                        var detailsRequest = "https://api.themoviedb.org/3/tv/" + result.id + "?api_key=af3af3fa226455dbdb23a95f0b6df146&language=en-US";
                        sendRequest(detailsRequest, response => {
                            nameCell.innerHTML = homepageLink(result.name, response.homepage);
                            if (response.status == "Ended" || response.status == "Canceled") {
                                dateCell.innerHTML = response.status + ".";
                            } else {
                                var next = response.next_episode_to_air;
                                if (next == null) {
                                    dateCell.innerHTML = "Not yet announced.";
                                } else {
                                    dateCell.innerHTML = formatDate(new Date(next.air_date));
                                }
                            }
                        });
                    }
                }
            });
        } else {
            console.log("hello");
            table.setAttribute("hidden", "");
            warning.removeAttribute("hidden");
        }
    });
    return false;
}

function sendRequest(query, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText));
        }
    }
    xhttp.open("GET", query, true);
    xhttp.send();
}

var months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function formatDate(date) {
    return date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear();
}

function homepageLink(title, page) {
    if (page != "")
        return '<a target="_blank" href="' + page + '">' + title + '</a>';
    else
        return title;
}