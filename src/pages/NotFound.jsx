import { Link } from 'react-router-dom'
import { PageHeader, Container } from '@/components/Section'

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="That page isn't here"
        intro="The link might be old, or we might have moved something. Either is possible."
      />
      <Container className="py-14">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          Go back to the home page
        </Link>
      </Container>
    </>
  )
}
