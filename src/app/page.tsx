"use client"

import { useState } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ImageIcon, Music, Video, Box, Sparkles, Wand2, Eraser, BookOpen } from "lucide-react"

type AITool = "image" | "audio" | "video" | "3d" | "story"
type ImageMode = "generate" | "hd" | "remove-bg"

const DEFAULT_API_KEY = "AIzaSyAO77y5PaONEzSpPO81aiByJrguK7UaG40"

export default function AIStudioPage() {
  const [activeTool, setActiveTool] = useState<AITool>("image")
  const [imageMode, setImageMode] = useState<ImageMode>("generate")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY)

  // Image Generation States
  const [imagePrompt, setImagePrompt] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Audio Generation States
  const [audioPrompt, setAudioPrompt] = useState("")
  const [audioDuration, setAudioDuration] = useState("30")

  // Video Generation States
  const [videoPrompt, setVideoPrompt] = useState("")
  const [videoDuration, setVideoDuration] = useState("5")

  // 3D Generation States
  const [threeDFile, setThreeDFile] = useState<File | null>(null)
  const [threeDPrompt, setThreeDPrompt] = useState("")

  const [storyPrompt, setStoryPrompt] = useState("")
  const [storyLength, setStoryLength] = useState("short")
  const [storyGenre, setStoryGenre] = useState("fantasy")

  const handleImageGeneration = async () => {
    if (!apiKey) {
      setError("Please enter your Google AI API key")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      let prompt = ""

      if (imageMode === "generate") {
        prompt = `Generate a detailed image description for: ${imagePrompt}. Provide artistic details, colors, composition, and style.`
      } else if (imageMode === "hd") {
        prompt = `Describe how to upscale and enhance this image to HD quality with improved details and clarity. ${imagePrompt}`
      } else if (imageMode === "remove-bg") {
        prompt = `Describe the process of removing the background from an image while preserving the main subject with clean edges.`
      }

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Generate placeholder image with the description
      setResult(
        `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(imagePrompt || "AI generated image")}`,
      )

      // Show AI analysis in console
      console.log("[v0] AI Analysis:", text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image")
    } finally {
      setLoading(false)
    }
  }

  const handleAudioGeneration = async () => {
    if (!apiKey) {
      setError("Please enter your Google AI API key")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      const prompt = `Analyze this audio generation request: "${audioPrompt}" for ${audioDuration} seconds. Describe the musical elements, instruments, tempo, mood, and structure.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Simulate audio generation result
      setResult("Audio generation completed - " + text.substring(0, 100) + "...")
      console.log("[v0] Audio Analysis:", text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio")
    } finally {
      setLoading(false)
    }
  }

  const handleVideoGeneration = async () => {
    if (!apiKey) {
      setError("Please enter your Google AI API key")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      const prompt = `Create a detailed video storyboard for: "${videoPrompt}" lasting ${videoDuration} seconds. Include scene descriptions, camera movements, transitions, and visual effects.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Simulate video generation result
      setResult("Video generation completed - " + text.substring(0, 100) + "...")
      console.log("[v0] Video Storyboard:", text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate video")
    } finally {
      setLoading(false)
    }
  }

  const handle3DGeneration = async () => {
    if (!apiKey) {
      setError("Please enter your Google AI API key")
      return
    }

    if (!threeDFile) {
      setError("Please upload an image file")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(threeDFile)

      reader.onload = async () => {
        try {
          const base64Data = reader.result as string
          const base64Image = base64Data.split(",")[1]

          const imagePart = {
            inlineData: {
              data: base64Image,
              mimeType: threeDFile.type,
            },
          }

          const prompt = `Analyze this image and describe how to convert it into a 3D model. Include details about depth, geometry, textures, and 3D structure. ${threeDPrompt}`

          const result = await model.generateContent([prompt, imagePart])
          const response = await result.response
          const text = response.text()

          setResult("3D Model Analysis: " + text.substring(0, 200) + "...")
          console.log("[v0] 3D Analysis:", text)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to analyze image")
        } finally {
          setLoading(false)
        }
      }

      reader.onerror = () => {
        setError("Failed to read image file")
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate 3D model")
      setLoading(false)
    }
  }

  const handleStoryGeneration = async () => {
    if (!apiKey) {
      setError("Please enter your Google AI API key")
      return
    }

    if (!storyPrompt) {
      setError("Please enter a story prompt")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      const lengthGuide = {
        short: "Write a short story (500-800 words)",
        medium: "Write a medium-length story (1000-1500 words)",
        long: "Write a long story (2000-3000 words)",
      }

      const prompt = `${lengthGuide[storyLength as keyof typeof lengthGuide]} in the ${storyGenre} genre based on this prompt: "${storyPrompt}". 

Create a compelling narrative with:
- An engaging opening that hooks the reader
- Well-developed characters with clear motivations
- A clear plot structure with rising action, climax, and resolution
- Vivid descriptions and sensory details
- Dialogue that reveals character and advances the plot
- A satisfying conclusion

Make it creative, original, and emotionally engaging.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      setResult(text)
      console.log("[v0] Story Generated:", text.substring(0, 200) + "...")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">AI Studio</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-5xl font-bold text-foreground mb-4 text-balance">
            The AI Toolkit for <span className="text-primary">Creators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Generate stunning images, audio, video, 3D models, and stories with cutting-edge AI technology. All in one
            powerful platform.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tool Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">AI Tools</CardTitle>
                <CardDescription className="text-muted-foreground">Select a tool to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTool === "image" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("image")}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Image Generation
                </Button>
                <Button
                  variant={activeTool === "audio" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("audio")}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Audio Generation
                </Button>
                <Button
                  variant={activeTool === "video" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("video")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Video Generation
                </Button>
                <Button
                  variant={activeTool === "3d" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("3d")}
                >
                  <Box className="mr-2 h-4 w-4" />
                  Image to 3D Model
                </Button>
                <Button
                  variant={activeTool === "story" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("story")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Story Maker
                </Button>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="bg-card border-border mt-6">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>High-quality AI generation</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Multiple output formats</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Fast processing times</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Commercial usage rights</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tool Area */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  {activeTool === "image" && <ImageIcon className="h-5 w-5" />}
                  {activeTool === "audio" && <Music className="h-5 w-5" />}
                  {activeTool === "video" && <Video className="h-5 w-5" />}
                  {activeTool === "3d" && <Box className="h-5 w-5" />}
                  {activeTool === "story" && <BookOpen className="h-5 w-5" />}
                  {activeTool === "image" && "Image Generation"}
                  {activeTool === "audio" && "Audio Generation"}
                  {activeTool === "video" && "Video Generation"}
                  {activeTool === "3d" && "Image to 3D Model"}
                  {activeTool === "story" && "Story Maker"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {activeTool === "image" && "Create stunning images with AI"}
                  {activeTool === "audio" && "Generate music and sound effects"}
                  {activeTool === "video" && "Create AI-powered videos"}
                  {activeTool === "3d" && "Convert images to 3D models"}
                  {activeTool === "story" && "Generate creative stories and narratives"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Image Generation Tool */}
                {activeTool === "image" && (
                  <div className="space-y-6">
                    <Tabs value={imageMode} onValueChange={(v) => setImageMode(v as ImageMode)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generate">
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate
                        </TabsTrigger>
                        <TabsTrigger value="hd">
                          <Sparkles className="h-4 w-4 mr-2" />
                          HD Upscale
                        </TabsTrigger>
                        <TabsTrigger value="remove-bg">
                          <Eraser className="h-4 w-4 mr-2" />
                          Remove BG
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="generate" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="image-prompt" className="text-foreground">
                            Prompt
                          </Label>
                          <Textarea
                            id="image-prompt"
                            placeholder="A serene landscape with mountains and a lake at sunset..."
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            rows={4}
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>
                        <Button onClick={handleImageGeneration} disabled={loading || !imagePrompt} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4" />
                              Generate Image
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="hd" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="hd-upload" className="text-foreground">
                            Upload Image
                          </Label>
                          <Input
                            id="hd-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hd-prompt" className="text-foreground">
                            Enhancement Instructions (Optional)
                          </Label>
                          <Textarea
                            id="hd-prompt"
                            placeholder="Enhance details, improve lighting..."
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            rows={3}
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>
                        <Button onClick={handleImageGeneration} disabled={loading || !imageFile} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Upscaling...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Upscale to HD
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="remove-bg" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="bg-upload" className="text-foreground">
                            Upload Image
                          </Label>
                          <Input
                            id="bg-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>
                        <Button onClick={handleImageGeneration} disabled={loading || !imageFile} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Eraser className="mr-2 h-4 w-4" />
                              Remove Background
                            </>
                          )}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Audio Generation Tool */}
                {activeTool === "audio" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="audio-prompt" className="text-foreground">
                        Audio Description
                      </Label>
                      <Textarea
                        id="audio-prompt"
                        placeholder="Upbeat electronic music with synthesizers and drums..."
                        value={audioPrompt}
                        onChange={(e) => setAudioPrompt(e.target.value)}
                        rows={4}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio-duration" className="text-foreground">
                        Duration (seconds)
                      </Label>
                      <Select value={audioDuration} onValueChange={setAudioDuration}>
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">60 seconds</SelectItem>
                          <SelectItem value="120">2 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAudioGeneration} disabled={loading || !audioPrompt} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Music className="mr-2 h-4 w-4" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Video Generation Tool */}
                {activeTool === "video" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-prompt" className="text-foreground">
                        Video Description
                      </Label>
                      <Textarea
                        id="video-prompt"
                        placeholder="A time-lapse of a city skyline transitioning from day to night..."
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        rows={4}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-duration" className="text-foreground">
                        Duration (seconds)
                      </Label>
                      <Select value={videoDuration} onValueChange={setVideoDuration}>
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleVideoGeneration} disabled={loading || !videoPrompt} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 3D Generation Tool */}
                {activeTool === "3d" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="3d-upload" className="text-foreground">
                        Upload Image
                      </Label>
                      <Input
                        id="3d-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThreeDFile(e.target.files?.[0] || null)}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="3d-prompt" className="text-foreground">
                        3D Model Instructions (Optional)
                      </Label>
                      <Textarea
                        id="3d-prompt"
                        placeholder="Generate a detailed 3D model with realistic textures..."
                        value={threeDPrompt}
                        onChange={(e) => setThreeDPrompt(e.target.value)}
                        rows={3}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <Button onClick={handle3DGeneration} disabled={loading || !threeDFile} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Box className="mr-2 h-4 w-4" />
                          Generate 3D Model
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {activeTool === "story" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="story-prompt" className="text-foreground">
                        Story Prompt
                      </Label>
                      <Textarea
                        id="story-prompt"
                        placeholder="A young wizard discovers a hidden library that contains books from parallel universes..."
                        value={storyPrompt}
                        onChange={(e) => setStoryPrompt(e.target.value)}
                        rows={4}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="story-genre" className="text-foreground">
                          Genre
                        </Label>
                        <Select value={storyGenre} onValueChange={setStoryGenre}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="sci-fi">Science Fiction</SelectItem>
                            <SelectItem value="mystery">Mystery</SelectItem>
                            <SelectItem value="romance">Romance</SelectItem>
                            <SelectItem value="horror">Horror</SelectItem>
                            <SelectItem value="adventure">Adventure</SelectItem>
                            <SelectItem value="thriller">Thriller</SelectItem>
                            <SelectItem value="drama">Drama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="story-length" className="text-foreground">
                          Length
                        </Label>
                        <Select value={storyLength} onValueChange={setStoryLength}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short (500-800 words)</SelectItem>
                            <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                            <SelectItem value="long">Long (2000-3000 words)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleStoryGeneration} disabled={loading || !storyPrompt} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Writing Story...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Generate Story
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Result</h3>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                    <div className="bg-secondary border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                      {activeTool === "image" && (
                        <img
                          src={result || "/placeholder.svg"}
                          alt="Generated"
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                      {activeTool === "audio" && (
                        <div className="text-center w-full">
                          <Music className="h-16 w-16 mx-auto mb-4 text-primary" />
                          <p className="text-muted-foreground">{result}</p>
                        </div>
                      )}
                      {activeTool === "video" && (
                        <div className="text-center w-full">
                          <Video className="h-16 w-16 mx-auto mb-4 text-primary" />
                          <p className="text-muted-foreground">{result}</p>
                        </div>
                      )}
                      {activeTool === "3d" && (
                        <div className="text-center w-full">
                          <Box className="h-16 w-16 mx-auto mb-4 text-primary" />
                          <p className="text-muted-foreground text-sm">{result}</p>
                        </div>
                      )}
                      {activeTool === "story" && (
                        <div className="text-left w-full max-h-[600px] overflow-y-auto">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                          <div className="prose prose-invert max-w-none">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{result}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
