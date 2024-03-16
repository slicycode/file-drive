'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useOrganization, useUser } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'

const formSchema = z.object({
  title: z.string().min(2).max(200),
  file: z
    .custom<FileList>((value) => value instanceof FileList, 'Required')
    .refine((value) => value.length > 0, 'Required'),
})

export function UploadButton() {
  const organization = useOrganization()
  const user = useUser()
  let orgId: string | undefined = undefined
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  if (organization.isLoaded && user.isLoaded)
    orgId = organization.organization?.id ?? user.user?.id

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const createFile = useMutation(api.files.createFile)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      file: undefined,
    },
  })

  const fileRef = form.register('file')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return

    const postUrl = await generateUploadUrl()

    const fileType = values.file[0].type

    const result = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': fileType,
      },
      body: values.file[0],
    })

    const { storageId } = await result.json()

    const types = {
      'image/png': 'image',
      'image/jpg': 'image',
      'image/jpeg': 'image',
      'image/gif': 'image',
      'image/svg+xml': 'image',
      'application/pdf': 'pdf',
      'text/csv': 'csv',
    } as Record<string, Doc<'files'>['type']>

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
        type: types[fileType],
      })

      toast({
        variant: 'success',
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error uploading file',
        description: 'An error occurred while uploading your file.',
      })
      return
    }

    form.reset()

    setIsDialogOpen(false)
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen)
        form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload file</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">Upload your file</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input type="file" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex items-center gap-2"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" color="white" />
                      Uploading
                    </>
                  ) : (
                    'Upload file'
                  )}
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
