<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\Bedrock\BedrockClient;

use Aws\BedrockRuntime\BedrockRuntimeClient;

class AwsController extends Controller
{
    protected $client = null;

    public function __construct() {
        // Constructor method, called when a new instance is created
        $this->client = new BedrockRuntimeClient([
            'version' => 'latest',
            'region' => env("AWS_DEFAULT_REGION")
        ]);
    }

    public function generateTest(Request $request)
    {
        // Force JSON response
        $request->headers->set('Accept', 'application/json');

        // Validate the incoming request
        $validated = $request->validate([
            'prompt' => 'required|string',
        ]);

        // Define the file path
        $promptFilePath = base_path('resources/prompt.txt');

        // Read the prompt from the file
        if (!file_exists($promptFilePath)) {
            die("Prompt file not found.");
        }

        $prompt = file_get_contents($promptFilePath);

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

            // Decode the extracted JSON string into an associative array
            $decodedContent = json_decode($contentJson, true);

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

            return response()->json($customResponse);

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
}
