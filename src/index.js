// Function to execute when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Set the URL fetching the data
    const baseURL = 'http://localhost:3000';

    // Function to fetch the films information form the API
    function fetchFilms() {
        return fetch(`${baseURL}/films`)
            // Show the response as JSON
            .then(res => res.json())
            // Handle any  errors
            .catch(error => console.error('Error fetching films:', error));
    }
   

    // Function to fetch a specific film by its id from the API
    function fetchFilmById(id) {
        return fetch(`${baseURL}/films/${id}`)
            .then(res => res.json())
            .catch(error => console.error('Error fetching films by  ID:', error));
    }

    // Function to update the ticket number for a film once a ticket is sold
    function updateTicketNumber(id, newTicketNumber) {
        return fetch(`${baseURL}/films/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            // Show in JSON form
            body: JSON.stringify({ tickets_sold: newTicketNumber}),
        })
        .then(res => res.json())
        .catch(error => console.error('Error updating ticket:', error));
    }

    // Function to create a new ticket
    function createTicket(filmId, numberOfTickets) {
        fetch(`${baseURL}/tickets`, {
            method: "POST",
            headers:  {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "film_id": filmId,
                "number_of_tickets":  numberOfTickets
            }),
        })
        .then(res => res.json())
        .catch(error => console.error('Error creating ticket:', error));
    }

    // Function to purchase tickets
    function purchaseTicket(filmId, ticketsSold, capacity) {
        // Get the buy ticket button and set its variable
        const buyTicketBtn = document.getElementById("buy-ticket");
        //Get the element for the ticket number
        const ticketNumberElement = document.getElementById('ticket-num');
    
            // Use  of if conditional to return different responses
            if (ticketsSold < capacity) {
                // Increment the count for tickets sold if there are still available tickets
                let newTicketNumber = ticketsSold + 1;
                // Update the frontend ticket number
                ticketNumberElement.textContent = capacity - newTicketNumber;
                // Send PATCH request
                return updateTicketNumber(filmId, newTicketNumber)
                .then(updatedFilm => {
                    if(updatedFilm) {
                        // if all tickets are sold out disable buy ticket button
                    if (updatedFilm.tickets_sold === capacity) {
                        buyTicketBtn.textContent = "Sold Out";
                        buyTicketBtn.disabled = true;
                    }
                // Create a new ticket
            return createTicket(filmId, 1)
            .then(createdTicket => {
                if (createdTicket) {
                    console.log("Ticket purchased successfully:", createdTicket);
                // Return updated film data
                return updatedFilm;
            }
            });
                
        }
                })
                .catch(error => console.error('Update ticket number error:', error));
                // If the film is sold out, notify the user using alert
            } else {
                alert("Film  is sold out!");
                return Promise.resolve();
            }
    };

     // Function to add a delete button next to each film
     function deleteFilm(id) {
        return fetch(`${baseURL}/films/${id}`, {
            method: "DELETE",
        })
        .then(() => {
            let filmItem = document.getElementById(`film-${id}`);
            if (filmItem) {
                filmItem.remove();
            }
        })
        .catch(error => console.error('Error deleting film:', error))
    } 

    // Function to show the films menu
    function filmMenu() {
            return fetchFilms()
            .then(films => {
                let filmMenu = document.getElementById("films");
                // Remove any previous lists
                filmMenu.innerHTML = "";

                // Iterate over each film using forEach and create list items
                films.forEach( (film, index) => {
                    let filmItem = document.createElement("li");
                    filmItem.id = `film-${film.id}`;
                    filmItem.classList.add("film", "item")
                    filmItem.textContent = film.title;
                    // Add an event listener  for each film to display its information when clicked
                    filmItem.addEventListener("click", () => {
                        fetchFilmById(film.id)
                        // Show details of the selected film
                        .then(selectedFilm => filmDetails(selectedFilm))
                        .catch (error => console.error('Fetch film by ID error:', error));
                    });

                    // Show  the delete button next to each film
                    let deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.addEventListener("click", () => {
                        deleteFilm(film.id)
                        .catch (error => console.error('Delete film error:', error));
                    });
                    // Append delete button to each film in the film menu
                    filmItem.appendChild(deleteButton);

                    // Append film item to the film menu
                    filmMenu.appendChild(filmItem);

                    // Display the first film details by default
                    if (index === 0) {
                        fetchFilmById(film.id)
                        .then(selectedFilm => filmDetails(selectedFilm))
                        .catch(error => console.error('Error fetching film by ID:', error));
                    }
                });
            })
            .catch(error => console.error('Error fetching films:', error));
    };


    // Function to show the details of the selected film
    function filmDetails(film) {
            // Get the elements for the film details
            let posterElement = document.getElementById('poster');
            posterElement.src = film.poster;
            let titleElement = document.getElementById('title');
            titleElement.textContent = film.title;
            let runtimeElement = document.getElementById('runtime');
            runtimeElement.textContent = `${film.runtime} minutes`;
            let showtimeElement = document.getElementById('showtime');
            showtimeElement.textContent = film.showtime;
            let descriptionElement = document.getElementById('film-info');
            descriptionElement.textContent = film.description;

            //Calculate the remaining tickets
            let remainingTickets = film.capacity - film.tickets_sold;
            //Get the element for the ticket number
            let ticketNumberElement = document.getElementById('ticket-num');
            // Display the ticket number
            if (remainingTickets >= 0) {
                ticketNumberElement.textContent = `${remainingTickets}`;
            } else if (remainingTickets === 0) {
                ticketNumberElement.textContent = "Sold Out"
            }


            // Get the buy ticket button and set it to a variable
            const buyTicketBtn = document.getElementById("buy-ticket");
            // Add an onclick event handler to the button
            buyTicketBtn.onclick = () => {
            // Purchase a ticket for the selected film
            purchaseTicket(film.id, film.tickets_sold, film.capacity, ticketNumberElement, buyTicketBtn)
            .then(updatedFilm => {
            // Use the if conditional to update the ticket purchase information
                if (updatedFilm) {
            // Calculate the number of remaining tickets after each purchase
            let remainingTickets = updatedFilm.capacity - updatedFilm.tickets_sold;
            // If a ticket is purchased update the ticket number
            if (remainingTickets >= 0) {
                ticketNumberElement.textContent = `${remainingTickets}`;
            } else if (remainingTickets === 0) {
                ticketNumberElement.textContent = "Sold Out"
            } else if (remainingTickets === 0) {
                // If all the tickets are sold out notify the user and disable the button
                ticketNumberElement.textContent = "Sold Out";
            }
        }
    })
    .catch(error => console.error('Ticket purchase error:', error));
        };
};
// Call the function to fetch and display
filmMenu();
})

            
            
           
           
    

