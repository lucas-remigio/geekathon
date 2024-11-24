<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\Bedrock\BedrockClient;
use App\Models\Pdf;
use Smalot\PdfParser\Parser;
use App\Models\User;

use Aws\BedrockRuntime\BedrockRuntimeClient;

class AwsController extends Controller
{
    protected $client = null;

    public function __construct()
    {
        $region = env("AWS_DEFAULT_REGION");

        if (!$region) {
            $region = 'us-west-2';
        }

        $this->client = new BedrockRuntimeClient([
            'version' => 'latest',
            'region' => $region,
            'http' => [
                'verify' => false, // Disable SSL certificate verification
            ],
        ]);
    }

    public function generateSummaries(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        // Validate the incoming request
        $validated = $request->validate([
            'number' => 'required|integer',
            'pdf_ids' => 'required|array',
            'pdf_ids.*' => 'integer|exists:pdfs,id',
        ]);

        // Fetch the PDFs from the database
        $pdfs = Pdf::whereIn('id', $validated['pdf_ids'])->get();

        $pdfParser = new Parser();

        switch($validated['number']) {
            case 1:
                $promptFilePath = base_path('resources/prompt100palavras.txt');
                break;
            case 2:
                $promptFilePath = base_path('resources/promptbytopics.txt');
                break;
            case 3:
                $promptFilePath = base_path('resources/promptextended.txt');
                break;
            case 4:
                $promptFilePath = base_path('resources/promptbrainrot.txt');
                break;
            default:
                return response()->json(['error' => 'Invalid summary type'], 400);
        }

        // Load the prompt content from the file
        $prompt = file_get_contents($promptFilePath);

        $pdfsContent = "";

        // Loop through each PDF and read its content
        foreach ($pdfs as $pdf) {
            $filePath = storage_path("app/private/{$pdf->file_path}"); // Adjust if your files are stored elsewhere

            if (!file_exists($filePath)) {
                return response()->json(['error' => "File not found", 'filePath' => $filePath], 404);
            }

            // Parse the PDF
            $pdfDocument = $pdfParser->parseFile($filePath);

            // Extract text from the PDF
            $pdfContent = $pdfDocument->getText();

            // Append the extracted text to the overall content
            $pdfsContent .= $pdfContent;
        }

        $promptToSend = $pdfsContent . "\n" . $prompt;
        try {

            // Call Amazon Bedrock for Llama model inference
            $response = $this->client->invokeModel([
                'modelId' => 'mistral.mistral-large-2402-v1:0', // Adjust to match your model ID
                'body' => json_encode([
                    'max_tokens' => 2048,
                    'top_p' => 1,
                    'stop' => [],
                    'temperature' => 0.7,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $promptToSend // Use the validated input as the content
                        ]
                    ],
                ]),
                'accept' => 'application/json',
                'contentType' => 'application/json',
            ]);

            $responseBody = json_decode($response['body'], true);

            return response()->json($responseBody);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

    }

    public function generateTest(Request $request)
    {
        // Force JSON response
        $request->headers->set('Accept', 'application/json');

        $chapterId = $request->query('chapterId');

        if (!$chapterId) {
            return response()->json([
                'error' => 'chapterId is required.'
            ], 400);
        }

        // Validate that chapterId is an integer
        if (!is_numeric($chapterId)) {
            return response()->json([
                'error' => 'Invalid chapterId. It must be a number.'
            ], 400);
        }

        // Retrieve all PDFs for the specified chapter ID
        $pdfs = Pdf::where('chapter_id', $chapterId)->get();

        // Check if PDFs exist for the given chapter ID
        if ($pdfs->isEmpty()) {
            return response()->json([
                'error' => 'No PDFs found for the given chapter ID.',
            ], 404);
        }

        $pdfParser = new Parser();

        $promptFilePath = base_path('resources/prompt.txt');

        // Read the prompt from the file
        if (!file_exists($promptFilePath)) {
            die("Prompt file not found.");
        }

        $prompt = file_get_contents($promptFilePath);

        $pdfsContent = "";

        // Loop through each PDF and read its content
        foreach ($pdfs as $pdf) {
            $filePath = storage_path("app/private/{$pdf->file_path}"); // Adjust if your files are stored elsewhere

            if (!file_exists($filePath)) {
                die("File not found: {$filePath}");
            }

            // Parse the PDF
            $pdfDocument = $pdfParser->parseFile($filePath);

            // Extract text from the PDF
            $pdfContent = $pdfDocument->getText();

            // Append the extracted text to the overall content
            $pdfsContent .= $pdfContent;
        }

        $promptToSend = $pdfsContent . "\n" . $prompt;

        try {

            // Increase execution time to 300 seconds (5 minutes)
            set_time_limit(300);

            // Alternatively, use ini_set to increase the execution time
            ini_set('max_execution_time', 300);

            // Call Amazon Bedrock for Llama model inference
            $response = $this->client->invokeModel([
                'modelId' => 'mistral.mistral-large-2407-v1:0', // Adjust to match your model ID
                'body' => json_encode([
                    'max_tokens' => 2048,
                    'top_p' => 1,
                    'stop' => [],
                    // rever este parametro
                    'temperature' => 0.7,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $promptToSend // Use the validated input as the content
                        ]
                    ],
                ]),
                'accept' => 'application/json',
                'contentType' => 'application/json',
            ]);

            $responseBody = json_decode($response['body'], true);

            // Extract the JSON string from the 'content' field
            if (!isset($responseBody['choices'][0]['message']['content'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid response structure: Content field not found',
                ], 500);
            }

            $contentJson = $responseBody['choices'][0]['message']['content'];

            // Dynamically extract the JSON within the outer brackets
            preg_match('/\{.*\}/s', $contentJson, $matches);

            if (empty($matches)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to extract valid JSON content.',
                ], 500);
            }

            $cleanedJson = $matches[0]; // Extracted JSON string

            // Decode the cleaned JSON string into an associative array
            $decodedContent = json_decode($cleanedJson, true);


            // Check if decoding was successful
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to decode content JSON: ' . json_last_error_msg(),
                ], 500);
            }

            $labels = ['A', 'B', 'C', 'D'];
            foreach ($decodedContent['multipleChoiceQuestions'] as $index => &$question) {
                $question['id'] = $index + 1;

                foreach ($question['choices'] as $choiceIndex => $choice) {
                    $question['choices'][$choiceIndex] = [
                        'label' => $labels[$choiceIndex],
                        'text' => $choice,
                    ];
                }

                // Find the correct answer based on the `text` field in the choices
                foreach ($question['choices'] as $choice) {
                    if ($choice['text'] === $question['correctAnswer']) {
                        $question['correctAnswer'] = $choice['label'];
                        break;
                    }
                }
            }

            // Prepare the custom response
            $customResponse = [
                'success' => true,
                'data' => [
                    'multipleChoiceQuestions' => $decodedContent['multipleChoiceQuestions'] ?? [],
                    'extensiveQuestion' => $decodedContent['extensiveQuestion'] ?? [],
                ],
            ];

            ob_start();
            $response = response()->json($customResponse);
            ob_end_flush();
            return $response;

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function test(Request $request)
    {
        return response()->json(['message' => 'Extract Data Endpoint Reached']);
    }

    public function correctExtensiveQuestion(Request $request)
    {
        // Force JSON response
        $request->headers->set('Accept', 'application/json');

        // Validate the incoming request
        $validated = $request->validate([
            'question' => 'required|string', // Validate the question input
            'answer' => 'required|string',   // Validate the answer input
        ]);

        $question = $validated['question'];
        $answer = $validated['answer'];

        $promptFilePath = base_path('resources/promptCorrectAnswer.txt');

        // Read the prompt from the file
        if (!file_exists($promptFilePath)) {
            die("Prompt file not found.");
        }

        // Prepare the prompt for OpenAI
        $prompt = file_get_contents($promptFilePath)
        . "Question: \"$question\"\n\n"
        . "Answer: \"$answer\"";

        try {

            // Increase execution time to 300 seconds (5 minutes)
            set_time_limit(300);

            // Alternatively, use ini_set to increase the execution time
            ini_set('max_execution_time', 300);

            // Call Amazon Bedrock for Llama model inference
            $response = $this->client->invokeModel([
                'modelId' => 'mistral.mistral-large-2402-v1:0', // Adjust to match your model ID
                'body' => json_encode([
                    'max_tokens' => 2048,
                    'top_p' => 1,
                    'stop' => [],
                    // rever este parametro
                    'temperature' => 0.7,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt // Use the validated input as the content
                        ]
                    ],
                ]),
                'accept' => 'application/json',
                'contentType' => 'application/json',
            ]);


            $responseBody = json_decode($response['body'], true);

            // Extract the JSON string from the 'content' field
            if (!isset($responseBody['choices'][0]['message']['content'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid response structure: Content field not found',
                ], 500);
            }

            $contentJson = $responseBody['choices'][0]['message']['content'];
            $decodedContent = json_decode($contentJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to decode JSON content from AI response',
                ], 500);
            }

            // ufind the user by id 1
            $user = User::find(1);

            // calculate xp based on the grade
            $xp = $decodedContent["grade"] * 1;
            $user->xp += $xp;


            $user->save();



            return response()->json([
                'success' => true,
                'grade' => $decodedContent["grade"],
                'feedback' => $decodedContent["feedback"],
                'xp' => $xp,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function correctMultipleChoiceQuestions(Request $request)
    {
        // Force JSON response
        $request->headers->set('Accept', 'application/json');

        // Validate the incoming request
        $validatedData = $request->validate([
            'results' => 'required|array',
            'results.*.question' => 'required|string',
            'results.*.isCorrect' => 'required|boolean',
            'results.*.chosenAnswer' => 'nullable|string',
        ]);

        $results = $validatedData['results'];

         // Prepare the prompt for AI correction
         $prompts = array_map(function ($result, $index) {
            return [
                'id' => $index + 1, // Generate a unique ID for each question
                'question' => $result['question'],
                'chosenAnswer' => $result['chosenAnswer'],
                'isCorrect' => $result['isCorrect'],
            ];
        }, $results, array_keys($results));

        // Read the prompt template from a file
        $promptFilePath = base_path('resources/promptMCQCorrect.txt');
        if (!file_exists($promptFilePath)) {
            die("Prompt file not found.");
        }
        $basePrompt = file_get_contents($promptFilePath);
        $promptContent = $basePrompt . "\n\n";

        foreach ($prompts as $prompt) {
            $promptContent .= "Question ID: {$prompt['id']}\n"; // Include the generated Question ID
            $promptContent .= "Question: {$prompt['question']}\n";
            $promptContent .= "Chosen Answer: {$prompt['chosenAnswer']}\n";
            $promptContent .= "Is correct?: " . ($prompt['isCorrect'] ? 'Yes' : 'No') . "\n\n";
        }

        try {
            // Increase execution time to 300 seconds (5 minutes)
            set_time_limit(300);

            // Alternatively, use ini_set to increase the execution time
            ini_set('max_execution_time', 300);

            // Call Amazon Bedrock for Llama model inference
            $response = $this->client->invokeModel([
                'modelId' => 'mistral.mistral-large-2402-v1:0', // Adjust to match your model ID
                'body' => json_encode([
                    'max_tokens' => 2048,
                    'top_p' => 1,
                    'stop' => [],
                    // rever este parametro
                    'temperature' => 0.7,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $promptContent // Use the validated input as the content
                        ]
                    ],
                ]),
                'accept' => 'application/json',
                'contentType' => 'application/json',
            ]);


            $responseBody = json_decode($response['body'], true);

            // Extract the JSON string from the 'content' field
            if (!isset($responseBody['choices'][0]['message']['content'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid response structure: Content field not found',
                ], 500);
            }

            $contentJson = $responseBody['choices'][0]['message']['content'];
            $decodedContent = json_decode($contentJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to decode JSON content from AI response',
                ], 500);
            }

            // ufind the user by id 1
            $user = User::find(1);

            // calculate xp based on the amount of correct guesses
            $numberOfCorrectGuesses = count(array_filter($results, function ($result) {
                return $result['isCorrect'];
            }));

            $xp = $numberOfCorrectGuesses * 1;

            $user->xp += $xp;
            // save the xp
            $user->save();

            return response()->json([
                'success' => true,
                'feedback' => $decodedContent, // Return AI feedback directly
                'xp' => $xp,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
