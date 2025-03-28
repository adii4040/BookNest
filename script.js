const searchInput = document.getElementById('searchInput');
const bookContainer = document.getElementById('bookContainer')
const changeLayout = document.getElementById('changeLayout')
const bookContainerClass = document.querySelector('.bookContainerClass')
const sortList = document.getElementById('sortList')
const sortId = document.getElementById('sortId')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const currentPageNum = document.getElementById('currentPage')



let bookDetails = []
let originalBookArray = []
let currentPage = 1
const bookPerPage = 12
let totalPages = 0
let isSorted = false
let sortType = ''


/*---Search the  book by Author or Title---*/
searchInput.addEventListener('input', () => {
    const searchValue = searchInput.value.toLowerCase();
    const filteredBooks = bookDetails.filter((book) =>
        book.title.toLowerCase().includes(searchValue) || 
        book.authors[0].toLowerCase().includes(searchValue)
    );
    renderBookData(filteredBooks);
});

/*-----Change the layout-----*/
changeLayout.addEventListener('click', () => {
    bookContainerClass.classList.toggle('grid')
    changeLayout.innerText = bookContainer.classList.contains('grid') ? 'LIST' : 'GRID'
    if(window.innerWidth > 606){
        bookContainer.style.width = bookContainer.classList.contains('grid') ? '90%' : '70%'

    }
    
})

/*----Function to fetch book data----*/

async function getBookData(page = 1){    /*-----Intitally user will be on page 1-----*/

    /*----tryCatch for error handling, in case theres an error in fetching API---*/
    try {
        const res = await fetch(`https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${bookPerPage}`) 
        if(!res.ok){
            console.log(`HTTP Error: ${res.status()}`)
        }
        const data = await res.json()

        const bookArray = data.data.data
        // console.log(bookArray)

        bookDetails = bookArray.map((book) => {
            let bookInfo = book.volumeInfo
            // console.log(bookInfo.canonicalVolumeLink)

            /*---Filtering the required field from the book data---*/

            return {
                title: bookInfo.title,
                authors: bookInfo.authors?.length > 1 ? [bookInfo.authors[0], bookInfo.authors[1]] : [bookInfo.authors?.[0] || "Unknown Author"],
                publishedDate: bookInfo.publishedDate || "No Date",
                publisher: bookInfo.publisher || "Unknown Publisher",
                imageLinks: {
                    thumbnail: bookInfo.imageLinks?.thumbnail || "default-thumbnail.jpg" // Provide a default image
                },
                categories: bookInfo.categories ? [bookInfo.categories[0]] : ["Unknown Category"],
                webLink : bookInfo.canonicalVolumeLink
            };
        })

        /*----Copying the bookDetails to use i  t for sorting----*/
        originalBookArray = [...bookDetails]
        // console.log(originalBookArray)

        /*---This is to keep the book sorted in the next page too---*/
        if(isSorted && sortType){
            if(sortType === 'Title'){
                sortByTitle(originalBookArray)
            }else{
                sortByDate(originalBookArray)
            }
        }else{
            renderBookData(originalBookArray)
        }

        /*----Pagination---*/
        totalPages = data.data.totalPages  /*---Total page is the last page only---*/

        updatePagination(page,totalPages)

    } catch (error) {
        console.log(error)
    }


}

function updatePagination(page, totalPages) {
    currentPageNum.innerText = page;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page >= totalPages;
}

/*---Previous btn ---*/
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getBookData(currentPage);
    }
});
/*---Next Btn---*/
nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        getBookData(currentPage);
    }
});

/*---Sorting the Book---*/
sortId.addEventListener('change', () => {
    const sortOption = sortId.value;
    // console.log(sortOption);

    if (sortOption === 'Title') {
        // console.log('Sort by Title');
        sortByTitle(bookDetails);
        isSorted = true;
        sortType = 'Title'
    } else if (sortOption === 'Date') {
        // console.log('Sorting by Date');
        sortByDate(bookDetails);
        isSorted = true;
        sortType = 'Date'
    } else {
        // console.log('Resetting to original');
        renderBookData(originalBookArray);
        isSorted = false;
    }
});

function sortByTitle(bookDetails) {
    // console.log('Books to sort:', bookDetails);
    let sortedBookbyTitle = [...bookDetails].sort((a, b) =>  a.title.localeCompare(b.title)); /*---Since the title could be case sensitive, we are using localeompare()---*/
    
    // console.log('Sorted by Title:', sortedBookbyTitle);
    renderBookData(sortedBookbyTitle);
}

function sortByDate(bookDetails) {
    let sortedBookbyDate = [...bookDetails].sort((a, b) => a.publishedDate > b.publishedDate ? 1 : -1) 
    renderBookData(sortedBookbyDate);
}

/*---Function to spread the the book array to pass  the value in the card to  display each card---*/
function renderBookData(bookArray){
    bookContainer.innerHTML = ''
    bookArray.forEach(book =>{
        card(book)        
    })
}

function card(target) {
    
    // console.log('this is target', target)

    /*----This is the container for the book Card-----*/
    const bookCard = document.createElement('div')
    bookCard.classList.add('bookCard')
    bookContainer.appendChild(bookCard)

    /*-----This is the conatiner for the Book Image----*/
    const bookImg = document.createElement('div')
    bookImg.classList.add('bookImg')
    bookCard.appendChild(bookImg)

    /*-----This is Book cover Image/Thumbnail-----*/
    const thumbnail = document.createElement('img')
    thumbnail.classList.add('thumbnail')
    thumbnail.src = target.imageLinks.thumbnail
    bookImg.appendChild(thumbnail)

    /*-----This is the container for the Book descriptions---*/
    const bookDesc = document.createElement('div')
    bookDesc.classList.add('bookDesc')
    bookCard.appendChild(bookDesc)

    /*----Title of the book----*/
    const title = document.createElement('h3')
    title.classList.add('title')
    title.innerText = target.title
    bookDesc.appendChild(title)

    /*----Author of the book---*/
    const author = document.createElement('p')
    author.classList.add('author')
    author.innerText = target.authors[0]
    bookDesc.appendChild(author)

    /*-----Publisher-----*/
    const publisher = document.createElement('p')
    publisher.classList.add('publisher')
    publisher.innerText = `Publisher-${target.publisher}`
    bookDesc.appendChild(publisher)

    /*----Published Date----*/
    const publishedDate = document.createElement('p')
    publishedDate.classList.add('publishedDate')
    publishedDate.innerText = target.publishedDate
    bookDesc.appendChild(publishedDate)

    /*----Category----*/
    const categories = document.createElement('p')
    categories.classList.add('categories')
    categories.innerText = target.categories
    bookDesc.appendChild(categories)

    /*--More---*/
    const more = document.createElement('a')
    more.classList.add('more')
    more.href= target.webLink
    more.innerText='More'
    bookDesc.appendChild(more)
}

getBookData(1)