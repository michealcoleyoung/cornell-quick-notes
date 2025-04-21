# Cornell Quick Notes
![Cornell Quick Notes Logo](images/cqn-logo.png)
A web application built with Flask to implement the Cornell Note-Taking Method. This app helps users organize their notes efficiently and effectively.

## Description

Cornell Quick Notes provides a simple and intuitive interface for creating and managing notes using the Cornell Note-Taking System. This system encourages active learning and better retention by dividing notes into three distinct sections:

*   **Cue Column (Main Points):** Keywords, questions, or prompts related to the main content.
*   **Note-Taking Column (Notes):** Detailed notes taken during lectures, readings, or meetings.
*   **Summary Box (Summary):** A concise summary of the key takeaways.

This application aims to provide a digital alternative to traditional paper-based Cornell notes, offering features like easy editing, organization, and accessibility.

## Features (Planned/Implemented)

* Basic Note Creation (Cue, Note, Summary sections)
* Note Editing
* Note Organization (Folders/Notebooks)
* Export Options (Markdown)
* Docker Support (Planned Feature)

## Technologies Used

*   Python
*   Flask
*   HTML
*   CSS
*   Bootstrap
* Brutopia (Neo Brutalist Styling Library)

Brutopia: https://rajnandan1.github.io/brutopia/dist/index.html

## Getting Started (Development)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/michealcoleyoung/cornell-quick-notes
    ```

2.  **Create and activate a virtual environment (recommended):**

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Linux/macOS
    .venv\Scripts\activate  # On Windows
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application:**

    ```bash
    flask --app app run
    ```

## Deployment (Docker - Planned)

TBD

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions or improvements.

## License

TBD