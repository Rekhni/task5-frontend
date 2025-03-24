import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LANGUAGES = [
  { label: "English (US)", code: "en_US" },
  { label: "German (DE)", code: "de_DE" },
  { label: "French (FR)", code: "fr_FR" },
];



export default function App() {
  const [language, setLanguage] = useState(LANGUAGES[0].code);
  const [seed, setSeed] = useState(42);
  const [likes, setLikes] = useState(5);
  const [reviews, setReviews] = useState(3);
  const [books, setBooks] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBooks = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("Fetching books...");
      console.log("Append mode:", append);
      console.log("Offset before fetch:", offset);

      const response = await axios.get("https://task5-backend-api.onrender.com/books", {
        params: { seed, language, count: append ? 10 : 20, likes, reviews, offset: append ? offset : 0 },
      });

      console.log("Fetched books:", response.data.length);
      console.log("Received books:", response.data);

      setBooks((prevBooks) => {
      const newBooks = append ? [...prevBooks, ...response.data] : response.data;
      console.log("New books list length:", newBooks.length);
      return newBooks;
      });

    if (append) {
      setOffset((prevOffset) => {
        const newOffset = prevOffset + 10;
        console.log("Updated offset after appending:", newOffset);
        return newOffset;
      });
    } else {
      setOffset(20);  // Start from 20 after the initial load
      console.log("Offset reset to 20 after initial load");
    }

      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    console.log("Language or settings changed. Resetting books and offset.");
    setBooks([]);
    setOffset(0);
    fetchBooks(false); 
  }, [seed, language, likes, reviews]);


  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50
      ) {
        if (!loadingMore) {
          fetchBooks(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore]);


  const toggleExpand = (index) => {
    setExpanded((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.clear();
        newExpanded.add(index);
      }
      return newExpanded;
    });
  };
  
  return (
    <div className="container p-4">
      <div className='d-flex justify-content-evenly align-items-center mb-4'>
        <div className="form-floating" style={{ width: "200px" }}>
          <select 
            className="form-select"
            value={language}
            id="floatingSelect"
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}  
          </select>
          <label htmlFor="floatingSelect">Language</label>
        </div>
        <div className="input-group" style={{ width: "200px" }}>
          <div className="form-floating flex-grow-1">
            <input
              type="text"
              className="form-control border-end-0"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              id="seedInput"
              placeholder="Seed"
            />
            <label htmlFor="seedInput">Seed</label>
          </div>
          <button
            className="btn border border-start-0"
            onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
          >
            <i className="bi bi-shuffle"></i>
          </button>
        </div>
        <div className="d-flex align-items-center mb-3">
          <label htmlFor="likesRange" className="me-2">
            Likes
          </label>
          <input
            type="range"
            className="form-range flex-grow-1"
            min={0}
            max={10}
            step={0.1}
            value={likes}
            id="likesRange"
            onChange={(e) => setLikes(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </div>
        <div className='form-floating' style={{ width: "200px" }}>
          <input
            type="number"
            className='form-control'
            value={reviews}
            step="0.1"
            id="reviewInput"
            onChange={(e) => setReviews(Number(e.target.value))}
          />
          <label htmlFor='reviewInput'>Reviews</label>
        </div>
      </div>
      <table className='table '>
        <thead>
          <tr>
            <th>#</th>
            <th>ISBN</th>
            <th>Title</th>
            <th>Author(s)</th>
            <th>Publisher</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, idx) => (
            <React.Fragment key={`book-${book.isbn}-${book.index}`}>
              <tr
                onClick={() => toggleExpand(book.index)}
                style={{ cursor: "pointer" }}
                className={expanded.has(book.index) ? "table-active" : ""}
              >
                <td className="fw-bold">{idx + 1}</td>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
              </tr>
              {expanded.has(book.index) && (
                <tr>
                  <td colSpan="5">
                    <div className='d-flex gap-3 p-3 bg-light border rounded'>
                      <div>
                        <img src={book.coverImage} 
                        alt={book.title} 
                        className="img-thumbnail mb-2"
                        style={{ width: "100px", height: "150px" }} />
                        <p className='text-center bg-primary text-light rounded-pill mx-auto' style={{ width: "50px", cursor: 'pointer' }}>
                          {book.likes} <i className='bi bi-hand-thumbs-up text-white'></i>
                        </p>
                      </div>
                      <div>
                        <div className='d-flex gap-2 flex-row align-items-center'>
                          <h3>{book.title}</h3>
                          <h5 className="mb-0 text-muted">Paperback</h5>
                        </div>
                        <p className='m-0'>by <i>{book.author}</i></p>
                        <p style={{ fontSize: '14px', color: 'grey', marginBottom: '2px' }}>{book.publisher}</p>
                        <h6>Review(s)</h6>
                        {Array.isArray(book.reviews) && book.reviews.length > 0 ? (
                          <ul style={{ listStyle: 'none' }}>
                            {book.reviews.map((review, idx) => (
                              <li key={`review-${book.isbn}-${idx}`}>
                                <p>{review.review}</p>
                                <p style={{ fontSize: "12px", color: 'grey' }}>- {review.reviewer}, {review.company}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No reviews yet.</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {loadingMore && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}


