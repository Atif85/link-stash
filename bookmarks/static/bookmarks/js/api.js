function getCsrfToken() {
    const input = document.querySelector(
        "#csrf-container [name=csrfmiddlewaretoken]",
    );
    return input ? input.value : "";
}

export function request(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "X-CSRFToken": getCsrfToken(),
        },
    };

    if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    return fetch(endpoint, options).then((response) => response.json());
}
