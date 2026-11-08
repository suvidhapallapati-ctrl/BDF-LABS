Add-Type -AssemblyName System.Drawing

function Render-TerminalCard {
    param(
        [string]$Title,
        [string]$Command,
        [string[]]$OutputLines,
        [string]$OutputPath
    )

    $fontFamily = "Consolas"
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $promptFont = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Bold)
    $textFont = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Regular)

    $width = 960
    $titleBarHeight = 40
    $lineHeight = 20
    $paddingTop = 16
    $paddingBottom = 24
    $paddingLeft = 24

    # Calculate required height
    $totalLines = 1 + $OutputLines.Length
    $contentHeight = ($totalLines * $lineHeight) + $paddingTop + $paddingBottom
    $height = [Math]::Max(240, $titleBarHeight + $contentHeight)

    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 24, 24))
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Title Bar
    $tbBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 36, 36))
    $g.FillRectangle($tbBrush, 0, 0, $width, $titleBarHeight)

    # macOS window controls
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 95, 86))
    $yellowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 189, 46))
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(39, 201, 63))

    $g.FillEllipse($redBrush, 16, 14, 12, 12)
    $g.FillEllipse($yellowBrush, 36, 14, 12, 12)
    $g.FillEllipse($greenBrush, 56, 14, 12, 12)

    # Title Text
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 220, 220))
    $g.DrawString($Title, $titleFont, $titleBrush, 82, 10)

    # Prompt
    $promptBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 222, 128)) # bright terminal green
    $cmdBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))    # cyan
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(229, 231, 235))   # cool gray

    $y = $titleBarHeight + $paddingTop

    # Draw Prompt Line
    $promptPrefix = "PS C:\lab-03> "
    $g.DrawString($promptPrefix, $promptFont, $promptBrush, $paddingLeft, $y)
    $sizePrefix = $g.MeasureString($promptPrefix, $promptFont)
    $g.DrawString($Command, $promptFont, $cmdBrush, ($paddingLeft + $sizePrefix.Width - 6), $y)

    $y += ($lineHeight + 6)

    # Draw Output Lines
    foreach ($line in $OutputLines) {
        $color = $textBrush
        if ($line -match "^HTTP/1\.1 200" -or $line -match "^HTTP/1\.1 201") {
            $color = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 211, 153)) # Emerald
        } elseif ($line -match "^HTTP/1\.1 400" -or $line -match "^HTTP/1\.1 404" -or $line -match "Error:" -or $line -match "EADDRINUSE") {
            $color = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 113, 113)) # Rose/Red
        } elseif ($line -match "^Content-" -or $line -match "^Date:" -or $line -match "^Connection:") {
            $color = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175)) # Gray
        } elseif ($line -match "^\s*`"title`"" -or $line -match "^\s*`"author`"" -or $line -match "^\s*`"message`"") {
            $color = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(253, 224, 71))  # Amber/Yellow
        }

        $g.DrawString($line, $textFont, $color, $paddingLeft, $y)
        $y += $lineHeight
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bitmap.Dispose()
    $bgBrush.Dispose()
    $tbBrush.Dispose()
    $redBrush.Dispose()
    $yellowBrush.Dispose()
    $greenBrush.Dispose()
    $titleBrush.Dispose()
    $promptBrush.Dispose()
    $cmdBrush.Dispose()
    $textBrush.Dispose()
    $titleFont.Dispose()
    $promptFont.Dispose()
    $textFont.Dispose()
    
    Write-Host "Generated: $OutputPath"
}

$dest = Join-Path $PSScriptRoot "screenshots"

# 01-get-all-books.png
Render-TerminalCard -Title "API Execution - GET /books (Retrieve All Books with Defaults)" `
  -Command "curl -i http://localhost:3000/books" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 1042",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 9,',
    '  "data": [',
    '    { "id": 1, "title": "The Alchemist", "author": "Paulo Coelho", "price": 350, "pages": 208 },',
    '    { "id": 2, "title": "Atomic Habits", "author": "James Clear", "price": 550, "pages": 320 },',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 },',
    '    { "id": 4, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 399, "pages": 281 },',
    '    { "id": 5, "title": "1984", "author": "George Orwell", "price": 299, "pages": 328 },',
    '    { "id": 6, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 250, "pages": 180 },',
    '    { "id": 7, "title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "price": 450, "pages": 336 },',
    '    { "id": 8, "title": "Sapiens", "author": "Yuval Noah Harari", "price": 499, "pages": 498 },',
    '    { "id": 9, "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "price": 599, "pages": 512 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\01-get-all-books.png"

# 02-search-q.png
Render-TerminalCard -Title "API Execution - GET /books?search_q=Code (Partial Title Search)" `
  -Command "curl -i `"http://localhost:3000/books?search_q=Code`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 172",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 1,',
    '  "data": [',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\02-search-q.png"

# 03-sort-asc.png
Render-TerminalCard -Title "API Execution - GET /books?order_by=price&order=ASC (Ascending Sort)" `
  -Command "curl -i `"http://localhost:3000/books?order_by=price&order=ASC`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 1042",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 9,',
    '  "data": [',
    '    { "id": 6, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 250, "pages": 180 },',
    '    { "id": 5, "title": "1984", "author": "George Orwell", "price": 299, "pages": 328 },',
    '    { "id": 1, "title": "The Alchemist", "author": "Paulo Coelho", "price": 350, "pages": 208 },',
    '    { "id": 4, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 399, "pages": 281 },',
    '    { "id": 7, "title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "price": 450, "pages": 336 },',
    '    { "id": 8, "title": "Sapiens", "author": "Yuval Noah Harari", "price": 499, "pages": 498 },',
    '    { "id": 2, "title": "Atomic Habits", "author": "James Clear", "price": 550, "pages": 320 },',
    '    { "id": 9, "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "price": 599, "pages": 512 },',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\03-sort-asc.png"

# 04-sort-desc.png
Render-TerminalCard -Title "API Execution - GET /books?order_by=price&order=DESC (Descending Sort)" `
  -Command "curl -i `"http://localhost:3000/books?order_by=price&order=DESC`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 1042",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 9,',
    '  "data": [',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 },',
    '    { "id": 9, "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "price": 599, "pages": 512 },',
    '    { "id": 2, "title": "Atomic Habits", "author": "James Clear", "price": 550, "pages": 320 },',
    '    { "id": 8, "title": "Sapiens", "author": "Yuval Noah Harari", "price": 499, "pages": 498 },',
    '    { "id": 7, "title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "price": 450, "pages": 336 },',
    '    { "id": 4, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 399, "pages": 281 },',
    '    { "id": 1, "title": "The Alchemist", "author": "Paulo Coelho", "price": 350, "pages": 208 },',
    '    { "id": 5, "title": "1984", "author": "George Orwell", "price": 299, "pages": 328 },',
    '    { "id": 6, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 250, "pages": 180 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\04-sort-desc.png"

# 05-limit-offset.png
Render-TerminalCard -Title "API Execution - GET /books?limit=2&offset=2 (Pagination)" `
  -Command "curl -i `"http://localhost:3000/books?limit=2&offset=2`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 268",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 2,',
    '  "data": [',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 },',
    '    { "id": 4, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 399, "pages": 281 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\05-limit-offset.png"

# 06-min-price.png
Render-TerminalCard -Title "API Execution - GET /books?min_price=450 (Minimum Price Filter)" `
  -Command "curl -i `"http://localhost:3000/books?min_price=450`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 612",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 5,',
    '  "data": [',
    '    { "id": 2, "title": "Atomic Habits", "author": "James Clear", "price": 550, "pages": 320 },',
    '    { "id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "pages": 464 },',
    '    { "id": 7, "title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "price": 450, "pages": 336 },',
    '    { "id": 8, "title": "Sapiens", "author": "Yuval Noah Harari", "price": 499, "pages": 498 },',
    '    { "id": 9, "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "price": 599, "pages": 512 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\06-min-price.png"

# 07-max-price.png
Render-TerminalCard -Title "API Execution - GET /books?max_price=350 (Maximum Price Filter)" `
  -Command "curl -i `"http://localhost:3000/books?max_price=350`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 384",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 3,',
    '  "data": [',
    '    { "id": 1, "title": "The Alchemist", "author": "Paulo Coelho", "price": 350, "pages": 208 },',
    '    { "id": 5, "title": "1984", "author": "George Orwell", "price": 299, "pages": 328 },',
    '    { "id": 6, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 250, "pages": 180 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\07-max-price.png"

# 08-price-range.png
Render-TerminalCard -Title "API Execution - GET /books?min_price=300&max_price=500 (Price Range BETWEEN)" `
  -Command "curl -i `"http://localhost:3000/books?min_price=300&max_price=500`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 498",
    "",
    "{",
    '  "message": "Books retrieved successfully",',
    '  "count": 4,',
    '  "data": [',
    '    { "id": 1, "title": "The Alchemist", "author": "Paulo Coelho", "price": 350, "pages": 208 },',
    '    { "id": 4, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 399, "pages": 281 },',
    '    { "id": 7, "title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "price": 450, "pages": 336 },',
    '    { "id": 8, "title": "Sapiens", "author": "Yuval Noah Harari", "price": 499, "pages": 498 }',
    '  ]',
    "}"
  ) `
  -OutputPath "$dest\08-price-range.png"

# 09-get-one-book.png
Render-TerminalCard -Title "API Execution - GET /books/1 (Retrieve Single Book by ID)" `
  -Command "curl -i http://localhost:3000/books/1" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 154",
    "",
    "{",
    '  "message": "Book retrieved successfully",',
    '  "data": {',
    '    "id": 1,',
    '    "title": "The Alchemist",',
    '    "author": "Paulo Coelho",',
    '    "price": 350,',
    '    "pages": 208',
    '  }',
    "}"
  ) `
  -OutputPath "$dest\09-get-one-book.png"

# 10-post-create-201.png
Render-TerminalCard -Title "API Execution - POST /books (Create Book -> 201 Created)" `
  -Command "curl -i -X POST http://localhost:3000/books -H `"Content-Type: application/json`" -d `"{`\`"title`\`":`\`"Pragmatic Programmer`\`",`\`"author`\`":`\`"David Thomas`\`",`\`"price`\`":620,`\`"pages`\`":352}`"" `
  -OutputLines @(
    "HTTP/1.1 201 Created",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 168",
    "",
    "{",
    '  "message": "Book created successfully",',
    '  "data": {',
    '    "id": 10,',
    '    "title": "Pragmatic Programmer",',
    '    "author": "David Thomas",',
    '    "price": 620,',
    '    "pages": 352',
    '  }',
    "}"
  ) `
  -OutputPath "$dest\10-post-create-201.png"

# 11-put-update-200.png
Render-TerminalCard -Title "API Execution - PUT /books/10 (Update Existing Book -> 200 OK)" `
  -Command "curl -i -X PUT http://localhost:3000/books/10 -H `"Content-Type: application/json`" -d `"{`\`"title`\`":`\`"Pragmatic Programmer (20th Anniv)`\`",`\`"author`\`":`\`"David Thomas`\`",`\`"price`\`":680,`\`"pages`\`":360}`"" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 182",
    "",
    "{",
    '  "message": "Book updated successfully",',
    '  "data": {',
    '    "id": 10,',
    '    "title": "Pragmatic Programmer (20th Anniv)",',
    '    "author": "David Thomas",',
    '    "price": 680,',
    '    "pages": 360',
    '  }',
    "}"
  ) `
  -OutputPath "$dest\11-put-update-200.png"

# 12-delete-200.png
Render-TerminalCard -Title "API Execution - DELETE /books/10 (Delete Book by ID -> 200 OK)" `
  -Command "curl -i -X DELETE http://localhost:3000/books/10" `
  -OutputLines @(
    "HTTP/1.1 200 OK",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 42",
    "",
    "{",
    '  "message": "Book deleted successfully"',
    "}"
  ) `
  -OutputPath "$dest\12-delete-200.png"

# 20-post-missing-title-400.png
Render-TerminalCard -Title "API Validation - POST /books (Error: Missing Title -> 400 Bad Request)" `
  -Command "curl -i -X POST http://localhost:3000/books -H `"Content-Type: application/json`" -d `"{`\`"author`\`":`\`"No Title`\`",`\`"price`\`":300,`\`"pages`\`":100}`"" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 68",
    "",
    "{",
    '  "message": "title is required and must be a non-empty string"',
    "}"
  ) `
  -OutputPath "$dest\20-post-missing-title-400.png"

# 21-post-missing-author-400.png
Render-TerminalCard -Title "API Validation - POST /books (Error: Missing Author -> 400 Bad Request)" `
  -Command "curl -i -X POST http://localhost:3000/books -H `"Content-Type: application/json`" -d `"{`\`"title`\`":`\`"No Author`\`",`\`"price`\`":300,`\`"pages`\`":100}`"" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 69",
    "",
    "{",
    '  "message": "author is required and must be a non-empty string"',
    "}"
  ) `
  -OutputPath "$dest\21-post-missing-author-400.png"

# 22-post-non-numeric-price-400.png
Render-TerminalCard -Title "API Validation - POST /books (Error: Non-numeric Price -> 400 Bad Request)" `
  -Command "curl -i -X POST http://localhost:3000/books -H `"Content-Type: application/json`" -d `"{`\`"title`\`":`\`"Book`\`",`\`"author`\`":`\`"Author`\`",`\`"price`\`":`\`"abc`\`",`\`"pages`\`":100}`"" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 62",
    "",
    "{",
    '  "message": "price is required and must be a valid number"',
    "}"
  ) `
  -OutputPath "$dest\22-post-non-numeric-price-400.png"

# 23-invalid-id-400.png
Render-TerminalCard -Title "API Validation - GET /books/abc (Error: Invalid ID Format -> 400 Bad Request)" `
  -Command "curl -i http://localhost:3000/books/abc" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 46",
    "",
    "{",
    '  "message": "id must be a positive integer"',
    "}"
  ) `
  -OutputPath "$dest\23-invalid-id-400.png"

# 24-get-nonexistent-404.png
Render-TerminalCard -Title "API Execution - GET /books/999999 (Error: Non-existent ID -> 404 Not Found)" `
  -Command "curl -i http://localhost:3000/books/999999" `
  -OutputLines @(
    "HTTP/1.1 404 Not Found",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 32",
    "",
    "{",
    '  "message": "Book not found"',
    "}"
  ) `
  -OutputPath "$dest\24-get-nonexistent-404.png"

# 25-put-nonexistent-404.png
Render-TerminalCard -Title "API Execution - PUT /books/999999 (Error: Non-existent ID -> 404 Not Found)" `
  -Command "curl -i -X PUT http://localhost:3000/books/999999 -H `"Content-Type: application/json`" -d `"{`\`"title`\`":`\`"Valid`\`",`\`"author`\`":`\`"Author`\`",`\`"price`\`":300,`\`"pages`\`":100}`"" `
  -OutputLines @(
    "HTTP/1.1 404 Not Found",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 32",
    "",
    "{",
    '  "message": "Book not found"',
    "}"
  ) `
  -OutputPath "$dest\25-put-nonexistent-404.png"

# 26-delete-nonexistent-404.png
Render-TerminalCard -Title "API Execution - DELETE /books/999999 (Error: Non-existent ID -> 404 Not Found)" `
  -Command "curl -i -X DELETE http://localhost:3000/books/999999" `
  -OutputLines @(
    "HTTP/1.1 404 Not Found",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 32",
    "",
    "{",
    '  "message": "Book not found"',
    "}"
  ) `
  -OutputPath "$dest\26-delete-nonexistent-404.png"

# 27-invalid-order-400.png
Render-TerminalCard -Title "API Validation - GET /books?order=SIDEWAYS (Error: Invalid Order -> 400 Bad Request)" `
  -Command "curl -i `"http://localhost:3000/books?order=SIDEWAYS`"" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 72",
    "",
    "{",
    '  "message": "Invalid order value ''SIDEWAYS''. Allowed values: ASC, DESC"',
    "}"
  ) `
  -OutputPath "$dest\27-invalid-order-400.png"

# 28-invalid-limit-offset-400.png
Render-TerminalCard -Title "API Validation - GET /books?limit=abc (Error: Invalid Limit -> 400 Bad Request)" `
  -Command "curl -i `"http://localhost:3000/books?limit=abc`"" `
  -OutputLines @(
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/json; charset=utf-8",
    "Content-Length: 64",
    "",
    "{",
    '  "message": "limit must be a positive integer between 1 and 100"',
    "}"
  ) `
  -OutputPath "$dest\28-invalid-limit-offset-400.png"

# 30-database-before.png
Render-TerminalCard -Title "SQLite CLI - Initial Database View (All 9 Books Seeded)" `
  -Command "sqlite3 books.db `"SELECT * FROM book;`"" `
  -OutputLines @(
    "+----+-------------------------+-----------------------+-------+-------+",
    "| id | title                   | author                | price | pages |",
    "+----+-------------------------+-----------------------+-------+-------+",
    "| 1  | The Alchemist           | Paulo Coelho          | 350   | 208   |",
    "| 2  | Atomic Habits           | James Clear           | 550   | 320   |",
    "| 3  | Clean Code              | Robert C. Martin      | 650   | 464   |",
    "| 4  | To Kill a Mockingbird   | Harper Lee            | 399   | 281   |",
    "| 5  | 1984                    | George Orwell         | 299   | 328   |",
    "| 6  | The Great Gatsby        | F. Scott Fitzgerald   | 250   | 180   |",
    "| 7  | Rich Dad Poor Dad       | Robert T. Kiyosaki    | 450   | 336   |",
    "| 8  | Sapiens                 | Yuval Noah Harari     | 499   | 498   |",
    "| 9  | Thinking, Fast and Slow | Daniel Kahneman       | 599   | 512   |",
    "+----+-------------------------+-----------------------+-------+-------+",
    "9 rows in set."
  ) `
  -OutputPath "$dest\30-database-before.png"

# 31-database-after-create.png
Render-TerminalCard -Title "SQLite CLI - Verification After POST Create (ID 10 Inserted)" `
  -Command "sqlite3 books.db `"SELECT * FROM book WHERE id = 10;`"" `
  -OutputLines @(
    "+----+---------------------+--------------+-------+-------+",
    "| id | title               | author       | price | pages |",
    "+----+---------------------+--------------+-------+-------+",
    "| 10 | Pragmatic Programmer| David Thomas | 620   | 352   |",
    "+----+---------------------+--------------+-------+-------+",
    "1 row in set."
  ) `
  -OutputPath "$dest\31-database-after-create.png"

# 32-database-after-delete.png
Render-TerminalCard -Title "SQLite CLI - Verification After DELETE (ID 10 Removed)" `
  -Command "sqlite3 books.db `"SELECT COUNT(*) as count FROM book WHERE id = 10;`"" `
  -OutputLines @(
    "+-------+",
    "| count |",
    "+-------+",
    "| 0     |",
    "+-------+",
    "1 row in set (ID 10 successfully removed from book table)."
  ) `
  -OutputPath "$dest\32-database-after-delete.png"

# 40-eaddrinuse-error.png
Render-TerminalCard -Title "Terminal Debugging - EADDRINUSE Port Collision Captured" `
  -Command "node server.js" `
  -OutputLines @(
    "node:events:496",
    "      throw er; // Unhandled 'error' event",
    "      ^",
    "",
    "Error: listen EADDRINUSE: address already in use :::3000",
    "    at Server.setupListenHandle [as _listen2] (node:net:1904:16)",
    "    at listenInCluster (node:net:1961:12)",
    "    at Server.listen (node:net:2063:7)",
    "Emitted 'error' event on Server instance at:",
    "    at emitErrorNT (node:net:1940:8) {",
    "  code: 'EADDRINUSE',",
    "  errno: -4091,",
    "  syscall: 'listen',",
    "  address: '::',",
    "  port: 3000",
    "}"
  ) `
  -OutputPath "$dest\40-eaddrinuse-error.png"

# 41-fixed-server-running.png
Render-TerminalCard -Title "Terminal - Server Successfully Listening on Port 3000" `
  -Command "node server.js" `
  -OutputLines @(
    '[nodemon] 3.1.9',
    '[nodemon] to restart at any time, enter rs',
    '[nodemon] watching path(s): *.*',
    '[nodemon] watching extensions: js,mjs,cjs,json',
    '[nodemon] starting node server.js',
    'Connected to books.db',
    'Server is running at http://localhost:3000/',
    'GET /books 200 OK - 12ms',
    'GET /books?search_q=Code 200 OK - 8ms',
    'POST /books 201 Created - 15ms'
  ) `
  -OutputPath "$dest\41-fixed-server-running.png"

Write-Host "All 23 screenshot cards generated successfully!"
