"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const availableSubjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Literature",
  "History",
  "Geography",
  "Computer Science",
  "Information Technology",
  "Economics",
  "Sociology",
]

export function AddTeacherModal({ open, onOpenChange, onAdd }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("password123")
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)

  const handleAddSubject = (subject) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject])
    }
  }

  const handleRemoveSubject = (subject) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
  }

  const handleSubmit = () => {
    if (firstName.trim() && lastName.trim() && email.trim()) {
      onAdd({
        firstName,
        lastName,
        email,
        password,
        assignedSubjects: selectedSubjects,
        status: "Active",
      })
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("password123")
      setSelectedSubjects([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>Create a new teacher account and assign subjects</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Assign Subjects</Label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                {selectedSubjects.length > 0 ? `${selectedSubjects.length} selected` : "Select subjects..."}
              </Button>
              {showSubjectDropdown && (
                <Card className="absolute z-10 w-full mt-1 top-full border-t-0 rounded-t-none">
                  <CardContent className="max-h-48 overflow-y-auto p-2">
                    {availableSubjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                        <input
                          type="checkbox"
                          id={subject}
                          checked={selectedSubjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddSubject(subject)
                            } else {
                              handleRemoveSubject(subject)
                            }
                          }}
                        />
                        <label htmlFor={subject} className="cursor-pointer flex-1">
                          {subject}
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            {selectedSubjects.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedSubjects.map((subject) => (
                  <Button key={subject} size="sm" variant="secondary" onClick={() => handleRemoveSubject(subject)}>
                    {subject} ×
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Teacher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
