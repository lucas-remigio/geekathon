<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{


    public function index(Request $request)
    {
        $query = Pdf::query();

        // Apply search filter
        if ($request->has('search')) {
            $query->where('file_name', 'like', '%' . $request->search . '%');
        }

        // Get all or filtered PDFs
        $pdfs = $query->get();

        // Return paginated PDFs
        return response()->json($pdfs);
    }

    public function show(Request $request, $id)
    {
        $pdf = Pdf::find($id);
    
        if (!$pdf) {
            return response()->json(['message' => 'Pdf not found'], 404);
        }
    
        // Get everything after the first '_'
        $fileName = substr($pdf->file_name, strpos($pdf->file_name, '_') + 1);
    
        return Storage::download($pdf->file_path, $fileName);
    }
    /**
     * Handle file uploads.
     */
    public function upload(Request $request)
    {
         // Validate the request to ensure it contains files
        if (!$request->hasFile('files')) {
            return response()->json([
                'success' => false,
                'message' => 'No files were uploaded.',
            ], 400); // Return a 400 Bad Request response
        }

        // Validate the request
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048', // Adjust the rules as needed
        ]);

        $uploadedFiles = [];


        foreach ($request->file('files') as $file) {
            // Generate a custom file name (e.g., include timestamp or unique ID)
            $customFileName = time() . '_' . $file->getClientOriginalName();

            // Store the file in the 'uploads' directory with the custom name
            $path = $file->storeAs('uploads', $customFileName, 'private');

            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'File could not be saved.',
                ], 500);
            }

            $pdf = new Pdf();
            $pdf->file_name = $customFileName;
            $pdf->file_path = $path;
            $pdf->save();


            // Add the file information to the response
            $uploadedFiles[] = [
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Files uploaded successfully.',
            'files' => $uploadedFiles,
        ]);
    }
}
